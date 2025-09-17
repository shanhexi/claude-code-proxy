
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const patchCode_1 = `
  // claude-code-proxy: Has been injected
  import fs from "fs";
  import path from "path";

  const LOG_PATH = path.resolve('${__dirname}', '../messages/messages.log');

  fs.writeFileSync(
    LOG_PATH,
    \`---Session \${new Date()}---\\n\`
  );

  function isAsyncIterable(x) { return x && typeof x[Symbol.asyncIterator] === 'function'; }
  const ts = () => new Date().toISOString();
  function uid() {
    return \`\${Date.now().toString(36)}-\${Math.random().toString(36).slice(2, 8)}\`;
  }

  function tapIteratorInPlaceWithTools(inner, onFinal) {
    if (!inner) return inner;

    const TAPPED = Symbol.for('anthropic.tap.iterator');
    if (inner[TAPPED]) return inner;
    Object.defineProperty(inner, TAPPED, { value: true, configurable: true });

    const byteLen = s =>
      typeof Buffer !== 'undefined'
        ? Buffer.byteLength(s, 'utf8')
        : new TextEncoder().encode(s).length;

    const makeWrapper = getOrigIter => function() {
      const it = getOrigIter();
      let text = '';

      const open = new Map();
      const done = [];
      const PREVIEW_CAP = Infinity;

      const start = (id, name) => {
        if (id == null || open.has(id)) return;
        open.set(id, { id, name: name||'unknown', startedAt: Date.now(), inputBytes: 0, preview: '' });
      };
      const delta = (id, chunk) => {
        if (id == null) return;
        if (!open.has(id)) start(id);
        const rec = open.get(id);
        if (!rec) return;
        const s = typeof chunk==='string' ? chunk : JSON.stringify(chunk||'');
        rec.inputBytes += byteLen(s);
        if (rec.preview.length < PREVIEW_CAP) {
          rec.preview += s.slice(0, PREVIEW_CAP - rec.preview.length);
        }
      };
      const stop = id => {
        const rec = open.get(id);
        if (!rec) return;
        open.delete(id);
        const finishedAt = Date.now();
        done.push({ ...rec, finishedAt, durationMs: finishedAt - rec.startedAt });
      };
      const finalizeDangling = err => {
        for (const rec of open.values()) {
          done.push({
            ...rec,
            finishedAt: Date.now(),
            durationMs: Date.now() - rec.startedAt,
            errored: err ? (err.stack||String(err)) : undefined
          });
        }
        open.clear();
      };

      return (async function*() {
        try {
          for await (const ev of it) {
            if (ev?.type==='content_block_delta' && ev.delta?.type==='text_delta' && typeof ev.delta.text==='string') {
              text += ev.delta.text;
            }
            if (ev?.type==='content_block_start' && ev.content_block?.type==='tool_use') {
              start(ev.index, ev.content_block.name);
            }
            if (ev?.type==='content_block_delta') {
              const d = ev.delta;
              if (typeof d.input_json_delta==='string') delta(ev.index, d.input_json_delta);
              if (typeof d.input_text_delta==='string') delta(ev.index, d.input_text_delta);
              if (typeof d.tool_use_delta==='string') delta(ev.index, d.tool_use_delta);
              if (d.type==='input_json_delta') delta(ev.index, d.partial_json);
              if (d.type==='input_text_delta') delta(ev.index, d.partial_text);
            }
            if (ev?.type==='content_block_stop' && ev.content_block?.type==='tool_use') {
              stop(ev.index);
            }
            if (ev?.type==='tool_use') {
              if (ev.start) start(ev.index, ev.name);
              if (typeof ev.delta==='string') delta(ev.index, ev.delta);
              if (ev.stop) stop(ev.index);
            }
            yield ev;
          }
          finalizeDangling();
          onFinal({ text, tools: done });
        } catch (e) {
          finalizeDangling(e);
          onFinal({ text, tools: done });
          throw e;
        }
      })();
    };

    const origSym = inner[Symbol.asyncIterator];
    if (typeof origSym==='function') {
      Object.defineProperty(inner, Symbol.asyncIterator, {
        value: makeWrapper(origSym.bind(inner)),
        configurable: true, writable: true
      });
      return inner;
    }
    if (typeof inner.iterator==='function') {
      Object.defineProperty(inner, 'iterator', {
        value: makeWrapper(inner.iterator.bind(inner)),
        configurable: true, writable: true
      });
      if (!inner[Symbol.asyncIterator]) {
        Object.defineProperty(inner, Symbol.asyncIterator, {
          value: () => inner.iterator(),
          configurable: true
        });
      }
    }
    return inner;
  }
`;

// New code to add
const patchCode_2 = `
  // Monkey-patch beta.messages.create for logging
  {
    const origCreate = this.beta.messages.create.bind(this.beta.messages);

    this.beta.messages.create = (...args) => {
      const params = args[0] || {};
      const callUid = uid();

      fs.appendFileSync(LOG_PATH, \`\${ts()} uid=\${callUid} input: \${JSON.stringify(params)}\\n\`);

      const ret = origCreate(...args);

      // Non-streaming: attach then for logging
      if (!params.stream) {
        ret.then(
          data => fs.appendFileSync(LOG_PATH, \`\${ts()} uid=\${callUid} output: \${JSON.stringify(data)}\\n\`),
          err  => fs.appendFileSync(LOG_PATH, \`\${ts()} uid=\${callUid} error: \${err.stack||String(err)}\\n\`)
        );
        return ret;
      }

      // Streaming: wrap the AsyncIterable response
      return ret._thenUnwrap((data, _props) => {
        if (isAsyncIterable(data)) {
          return tapIteratorInPlaceWithTools(data, final =>
            fs.appendFileSync(LOG_PATH, \`\${ts()} uid=\${callUid} stream.final: \${JSON.stringify(final)}\\n\`)
          );
        }
        return data;
      });
    };
  };
`;

function insertLetA1ToTargetPosition(originalCode) {
    const preciseRegex = /(\s+super\(\.\.\.arguments\);\s+)(\s+this\.\w+\s*=\s*new\s+\w+\(this\)(?:,\s*this\.\w+\s*=\s*new\s+\w+\(this\))*\s*;?)/;
    const modifiedCode = originalCode.replace(preciseRegex, (match, group1, group2) => {
        const indent = group2.match(/^\s+/)[0];
        return `${group1}${group2}\n${indent}${patchCode_2}`;
    });

    return modifiedCode;
}

// Read file content
const alternateFile = (cliPath)=>{
  fs.readFile(cliPath, 'utf8', (err, data) => {
     if (err) {
         console.error('Error reading file:', err);
         return;
     }
 
     // Execute replacement, add new code after the last matched line
     // $1 is the preceding code part, $2 is the last line of code
     let modifiedData = insertLetA1ToTargetPosition(data);
 
     modifiedData = modifiedData.split('\n');
 
     // Insert at the second line
     modifiedData.splice(1, 0, patchCode_1)
 
     // Write back to file
     fs.writeFile(cliPath, modifiedData.join('\n'), 'utf8', (err) => {
         if (err) {
             console.error('Error writing file:', err);
             return;
         }
     });
 });
}

export default alternateFile;
