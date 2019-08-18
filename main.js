const escapeMap = new Map([
  ['\t', '\\t'],
  ['\r', '\\r'],
  ['\n', '\\n'],
  ['"', '\\"'],
  ['\'', '\\\''],
  ['\\', '\\\\'],
]);

const unescapeMap = new Map(Array.from(escapeMap.entries()).map(([k, v]) => [v, k]));


/**
 * @param {string} str
 * @returns {string}
 */
function escapeCf(str) {
  return str.split('\n').map(line => {
    if (line[0] === ';') {
      return line;
    }
    const match = line.match(/^([^=]+)="((?:[^"\\]|\\.)*)"(.*)$/);
    if (!match) {
      return line;
    }
    const unescapedValue = match[2].replace(/\\./g, s => unescapeMap.get(s) || s);
    const escapedUnescapedValue = [...unescapedValue].map(char => '\\x' + char.codePointAt(0).toString(16).toUpperCase()).join('');
    return `${match[1]}="${escapedUnescapedValue}"${match[3]}`;
  }).join('\n');
}


/**
 * @param {string} str
 * @returns {string}
 */
function unescapeCf(str) {
  return str.split('\n').map(line => {
    if (line[0] === ';') {
      return line;
    }
    const match = line.match(/^([^=]+)="([^"]*)"(.*)$/);
    if (!match) {
      return line;
    }
    const unescapedValue = match[2].replace(/\\x([\da-fA-F]+)/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
    const escapedUnescapedValue = [...unescapedValue].map(char => escapeMap.get(char) || char).join('');
    return `${match[1]}="${escapedUnescapedValue}"${match[3]}`;
  }).join('\n');
}


function doEscape() {
  escapedElement.value = escapeCf(unescapedElement.value);
}

function doUnescape() {
  unescapedElement.value = unescapeCf(escapedElement.value);
}


const escapedElement = document.getElementById('escaped');
const unescapedElement = document.getElementById('unescaped');

for (const eventName of ['keyup', 'change']) {
  escapedElement.addEventListener(eventName, doUnescape);
  unescapedElement.addEventListener(eventName, doEscape);
}


document.body.addEventListener('keydown', event => {
  if (!event.ctrlKey || !event.shiftKey || event.altKey) {
    return;
  }

  switch (event.code) {
    case 'Digit1':
    {
      const str = 'datapath="$(exepath)\\\\savedata"';
      if (/^datapath=/m.test(unescapedElement.value)) {
        unescapedElement.value = unescapedElement.value.replace(/^datapath="(?:[^"\\]|\\.)*"/mg, str);
      } else {
        unescapedElement.value = unescapedElement.value.replace(/^(?:;.*?(\n|$))*/, (all, end) => `${all}${!all || end ? '' : '\n'}${str}\n`);
      }
      doEscape();
      event.preventDefault();
      break;
    }
  }
});
