import { DataTypeMap, FormatDataResult } from './types';

/**
 * @param {object} query 参数对象
 * @return {string} 拼接完成的字符串
 * @description 把query参数按格式拼接在URL上
 */
export function parseQuery(query: Record<string, unknown>): string {
  let newQuery = '';
  Object.keys(query).forEach(key => {
    newQuery += `${key}=${query[key]}&`;
  });
  return newQuery.slice(0, newQuery.length - 1);
}

/**
 *
 * @param {object} data body数据
 * @param {string} type 定义的dataType
 * @description 根据不同Content-Type的类型格式body数据
 * @returns 返回 对象包含data和type分别代表body和Content-Type
 */
export function formatData(data: unknown, type: string): FormatDataResult {
  const dataType: DataTypeMap = {
    json: {
      'Content-Type': 'application/json;charset=UTF-8',
      format(params: unknown) {
        return JSON.stringify(params);
      },
    },
    'form-urlencoded': {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      format(params: unknown) {
        const urlencoded = new URLSearchParams();
        const paramObj = params as Record<string, unknown>;
        for (const key in paramObj) {
          if (Object.prototype.hasOwnProperty.call(paramObj, key)) {
            urlencoded.append(key, String(paramObj[key]));
          }
        }
        return urlencoded.toString();
      },
    },
    'form-data': {
      'Content-Type': 'multipart/form-data;charset=UTF-8',
      format(params: unknown) {
        const _formData = new FormData();
        const paramObj = params as Record<string, unknown>;
        Object.keys(paramObj).forEach(key => {
          _formData.append(key, paramObj[key] as string | Blob);
        });
        return _formData;
      },
    },
    html: {
      type: 'text/html;charset=UTF-8',
      format(params: unknown) {
        return params;
      },
    },
    xml: {
      type: 'application/xml;charset=UTF-8',
      format(params: unknown) {
        return params;
      },
    },
  };
  if (!dataType[type]) {
    throw new Error('Invalid data type');
  }
  return {
    type: dataType[type]['Content-Type'] || dataType[type].type || '',
    data: dataType[type].format(data),
  };
}

/**
 * @param {object} obj 对象
 * @param {array} keys 忽略掉对象中的key项
 * @description 过滤掉对象里无用的key值对
 * @returns {object} 新对象不包含过滤掉的key值对
 */
export function omitObj(
  obj: Record<string, unknown> = {},
  keys: string[] = []
): Record<string, unknown> {
  return Object.keys(obj).reduce(
    (prev, key) => {
      if (!keys.includes(key)) {
        prev[key] = obj[key];
      }
      return prev;
    },
    {} as Record<string, unknown>
  );
}
