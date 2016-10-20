import { dirname, isAbsolute, resolve } from 'path';
import { readFileSync } from 'fs';
import parser from 'css-parse';
import camelize from 'to-camel-case';

const defaultOptions = {};
const RULE = 'rule';
const DECLARATION = 'declaration';
const styleSheetConstants = {
  'hairline-width': 'require(\'react-native\').StyleSheet.hairlineWidth',
};

function normalizeValue(property, value) {
  const normalizeProps = [
    'flex',
    'width',
    'height',
    'top',
    'right',
    'bottom',
    'left',
    'font-size',
    'line-height',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'padding-vertical',
    'padding-horizontal',
    'border-top-width',
    'border-right-width',
    'border-bottom-width',
    'border-left-width',
    'border-radius',
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-left-radius',
    'border-bottom-right-radius',
    'border-width',
    'shadow-opacity',
    'shadow-radius',
    'elevation',
  ];

  if (normalizeProps.indexOf(property) > -1) {
    const camelizedPropName = camelize(property);

    if (styleSheetConstants[value]) {
      return {
        [camelizedPropName]: value,
      };
    }

    const v = Number(value);

    if (isNaN(v)) {
      throw new Error(`Unexpected string value ${value} for ${property}.`);
    }

    return {
      [camelizedPropName]: v,
    };
  }

  return {};
}

function expandProperty(property, value) {
  const expandProps = ['margin', 'padding', 'shadow-offset'];

  if (expandProps.indexOf(property) > -1) {
    const shorthandValues = value.split(' ').map(n => parseInt(n, 10));
    const [v1, v2, v3, v4] = shorthandValues;
    const len = shorthandValues.length;

    if (property === 'shadow-offset') {
      return {
        shadowOffset: {
          width: v1,
          height: v2,
        },
      };
    }

    if (len === 1) {
      return {
        [`${property}`]: v1,
      };
    }

    const shorthand = {
      [`${property}`]: 0,
      [`${property}Top`]: v1,
      [`${property}Right`]: v2,
    };

    if (len === 2) {
      return {
        ...shorthand,
        [`${property}Bottom`]: v1,
        [`${property}Left`]: v2,
      };
    }

    if (len === 3) {
      return {
        ...shorthand,
        [`${property}Bottom`]: v3,
        [`${property}Left`]: v2,
      };
    }

    if (len === 4) {
      return {
        ...shorthand,
        [`${property}Bottom`]: v3,
        [`${property}Left`]: v4,
      };
    }
  }

  return {};
}

function toStyleSheet(styleData) {
  const { stylesheet: { rules } } = parser(styleData);
  const result = {};

  for (const { type: ruleType, selectors, declarations } of rules) {
    if (ruleType !== RULE) continue;

    for (const selector of selectors) {
      const s = selector.replace(/\.|#/g, '');
      result[s] = result[s] || {};

      for (const { type: declarationType, value, property } of declarations) {
        if (declarationType !== DECLARATION) continue;

        const propertyName = ['-ios-', '-android-'].reduce((m, v) => m.replace(v, ''), property);
        const camelizedPropName = camelize(propertyName);

        if (value) {
          result[s] = {
            ...result[s],
            ...{
              [camelizedPropName]: value,
            },
            ...normalizeValue(propertyName, value),
            ...expandProperty(propertyName, value),
          };
        }
      }
    }
  }

  let output = JSON.stringify(result);

  for (const key of Object.keys(styleSheetConstants)) {
    output = output.replace(`"${key}"`, styleSheetConstants[key]);
  }

  return output;
}

export default function transformAssets({ types: t }) {
  function resolveModulePath(filename) {
    const dir = dirname(filename);
    if (isAbsolute(dir)) {
      return dir;
    }
    if (process.env.PWD) {
      return resolve(process.env.PWD, dir);
    }
    return resolve(dir);
  }

  return {
    visitor: {
      CallExpression(path, { file, opts }) {
        const currentConfig = { ...defaultOptions, ...opts };

        currentConfig.extensions = currentConfig.extensions || [];

        const { callee: { name: calleeName }, arguments: args } = path.node;

        if (calleeName !== 'require' || !args.length || !t.isStringLiteral(args[0])) {
          return;
        }

        if (currentConfig.extensions.find(ext => args[0].value.endsWith(ext))) {
          const [{ value: filePath }] = args;

          if (!t.isVariableDeclarator(path.parent)) {
            throw new Error(`Found empty import from ${filePath}.`);
          }

          const from = resolveModulePath(file.opts.filename);
          const data = readFileSync(resolve(from, filePath), 'utf8');
          const p = toStyleSheet(data);

          path.replaceWithSourceString(`require('react-native').StyleSheet.create(${p})`);
        }
      },
    },
  };
}
