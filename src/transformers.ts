import { DataTransformer } from './types';

// 请求数据转换器
export class RequestTransformers {
  // JSON 序列化转换器
  static jsonStringify: DataTransformer = (data: unknown) => {
    if (data === null || data === undefined) return data;
    if (typeof data === 'string') return data;
    return JSON.stringify(data);
  };

  // URL 编码转换器
  static urlEncoded: DataTransformer = (data: unknown) => {
    if (!data || typeof data !== 'object') return data;

    const params = new URLSearchParams();
    Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, String(value));
      }
    });
    return params.toString();
  };

  // FormData 转换器
  static formData: DataTransformer = (data: unknown) => {
    if (!data || typeof data !== 'object') return data;
    if (data instanceof FormData) return data;

    const formData = new FormData();
    Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (value instanceof File || value instanceof Blob) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });
    return formData;
  };

  // 数组扁平化转换器
  static flattenArray: DataTransformer = (data: unknown) => {
    if (!Array.isArray(data)) return data;
    return data.flat();
  };

  // 对象键名转换器（驼峰转下划线）
  static camelToSnake: DataTransformer = (data: unknown) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return data;

    const converted: Record<string, unknown> = {};
    Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
      const snakeKey = key.replace(
        /[A-Z]/g,
        letter => `_${letter.toLowerCase()}`
      );
      converted[snakeKey] = value;
    });
    return converted;
  };

  // 移除空值转换器
  static removeEmpty: DataTransformer = (data: unknown) => {
    if (!data || typeof data !== 'object') return data;

    if (Array.isArray(data)) {
      return data.filter(
        item => item !== null && item !== undefined && item !== ''
      );
    }

    const cleaned: Record<string, unknown> = {};
    Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        cleaned[key] = value;
      }
    });
    return cleaned;
  };

  // 数据验证转换器
  static validate(schema: (data: unknown) => boolean): DataTransformer {
    return (data: unknown) => {
      if (!schema(data)) {
        throw new Error('Data validation failed');
      }
      return data;
    };
  }

  // 自定义转换器组合
  static compose(...transformers: DataTransformer[]): DataTransformer {
    return (data: unknown) => {
      return transformers.reduce(
        (result, transformer) => transformer(result),
        data
      );
    };
  }
}

// 响应数据转换器
export class ResponseTransformers {
  // JSON 解析转换器
  static jsonParse: DataTransformer = (data: unknown) => {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    }
    return data;
  };

  // 提取数据字段转换器
  static extractData(dataField: string = 'data'): DataTransformer {
    return (data: unknown) => {
      if (data && typeof data === 'object' && dataField in data) {
        return (data as Record<string, unknown>)[dataField];
      }
      return data;
    };
  }

  // 数组包装转换器
  static wrapArray: DataTransformer = (data: unknown) => {
    return Array.isArray(data) ? data : [data];
  };

  // 对象键名转换器（下划线转驼峰）
  static snakeToCamel: DataTransformer = (data: unknown) => {
    if (!data || typeof data !== 'object') return data;

    if (Array.isArray(data)) {
      return data.map(item => ResponseTransformers.snakeToCamel(item));
    }

    const converted: Record<string, unknown> = {};
    Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      );
      converted[camelKey] =
        typeof value === 'object' && value !== null
          ? ResponseTransformers.snakeToCamel(value)
          : value;
    });
    return converted;
  };

  // 日期转换器
  static parseDate(
    dateFields: string[] = ['created_at', 'updated_at', 'date']
  ): DataTransformer {
    return (data: unknown) => {
      if (!data || typeof data !== 'object') return data;

      if (Array.isArray(data)) {
        return data.map(item =>
          ResponseTransformers.parseDate(dateFields)(item)
        );
      }

      const converted: Record<string, unknown> = {
        ...(data as Record<string, unknown>),
      };
      dateFields.forEach(field => {
        if (field in converted && typeof converted[field] === 'string') {
          converted[field] = new Date(converted[field] as string);
        }
      });
      return converted;
    };
  }

  // 数字转换器
  static parseNumbers(numberFields: string[]): DataTransformer {
    return (data: unknown) => {
      if (!data || typeof data !== 'object') return data;

      if (Array.isArray(data)) {
        return data.map(item =>
          ResponseTransformers.parseNumbers(numberFields)(item)
        );
      }

      const converted: Record<string, unknown> = {
        ...(data as Record<string, unknown>),
      };
      numberFields.forEach(field => {
        if (field in converted && typeof converted[field] === 'string') {
          const num = Number(converted[field]);
          if (!isNaN(num)) {
            converted[field] = num;
          }
        }
      });
      return converted;
    };
  }

  // 布尔值转换器
  static parseBooleans(boolFields: string[]): DataTransformer {
    return (data: unknown) => {
      if (!data || typeof data !== 'object') return data;

      if (Array.isArray(data)) {
        return data.map(item =>
          ResponseTransformers.parseBooleans(boolFields)(item)
        );
      }

      const converted: Record<string, unknown> = {
        ...(data as Record<string, unknown>),
      };
      boolFields.forEach(field => {
        if (field in converted) {
          const value = converted[field];
          if (typeof value === 'string') {
            converted[field] = value.toLowerCase() === 'true' || value === '1';
          } else if (typeof value === 'number') {
            converted[field] = value !== 0;
          }
        }
      });
      return converted;
    };
  }

  // 错误转换器
  static handleError: DataTransformer = (data: unknown) => {
    if (data && typeof data === 'object' && 'error' in data) {
      const errorData = data as {
        error: unknown;
        message?: string;
        code?: string;
      };
      throw new Error(errorData.message || 'API Error');
    }
    return data;
  };

  // 分页数据转换器
  static extractPagination: DataTransformer = (data: unknown) => {
    if (!data || typeof data !== 'object') return data;

    const response = data as Record<string, unknown>;

    // 检测常见的分页结构
    if ('data' in response && 'pagination' in response) {
      return {
        items: response.data,
        pagination: response.pagination,
      };
    }

    if ('items' in response && 'total' in response) {
      return {
        items: response.items,
        pagination: {
          total: response.total,
          page: response.page || 1,
          pageSize: response.pageSize || response.per_page || 10,
        },
      };
    }

    return data;
  };

  // 空值处理转换器
  static handleNulls(replaceWith: unknown = null): DataTransformer {
    return (data: unknown) => {
      if (data === null || data === undefined) return replaceWith;

      if (Array.isArray(data)) {
        return data.map(item =>
          ResponseTransformers.handleNulls(replaceWith)(item)
        );
      }

      if (typeof data === 'object') {
        const converted: Record<string, unknown> = {};
        Object.entries(data as Record<string, unknown>).forEach(
          ([key, value]) => {
            converted[key] =
              value === null || value === undefined
                ? replaceWith
                : ResponseTransformers.handleNulls(replaceWith)(value);
          }
        );
        return converted;
      }

      return data;
    };
  }

  // 自定义转换器组合
  static compose(...transformers: DataTransformer[]): DataTransformer {
    return (data: unknown) => {
      return transformers.reduce(
        (result, transformer) => transformer(result),
        data
      );
    };
  }
}

// 通用转换器
export class CommonTransformers {
  // 深拷贝转换器
  static deepClone: DataTransformer = (data: unknown) => {
    if (data === null || typeof data !== 'object') return data;
    return JSON.parse(JSON.stringify(data));
  };

  // 类型断言转换器
  static assertType<T>(
    typeGuard: (data: unknown) => data is T
  ): DataTransformer {
    return (data: unknown) => {
      if (!typeGuard(data)) {
        throw new Error('Type assertion failed');
      }
      return data;
    };
  }

  // 默认值转换器
  static withDefault<T>(defaultValue: T): DataTransformer {
    return (data: unknown) => {
      return data === null || data === undefined ? defaultValue : data;
    };
  }

  // 条件转换器
  static conditional(
    condition: (data: unknown) => boolean,
    transformer: DataTransformer
  ): DataTransformer {
    return (data: unknown) => {
      return condition(data) ? transformer(data) : data;
    };
  }

  // 映射转换器
  static map<T, R>(mapFn: (item: T) => R): DataTransformer {
    return (data: unknown) => {
      if (!Array.isArray(data)) return data;
      return data.map(mapFn);
    };
  }

  // 过滤转换器
  static filter<T>(filterFn: (item: T) => boolean): DataTransformer {
    return (data: unknown) => {
      if (!Array.isArray(data)) return data;
      return data.filter(filterFn);
    };
  }

  // 排序转换器
  static sort<T>(compareFn?: (a: T, b: T) => number): DataTransformer {
    return (data: unknown) => {
      if (!Array.isArray(data)) return data;
      return [...data].sort(compareFn);
    };
  }

  // 限制数量转换器
  static limit(count: number): DataTransformer {
    return (data: unknown) => {
      if (!Array.isArray(data)) return data;
      return data.slice(0, count);
    };
  }

  // 跳过转换器
  static skip(count: number): DataTransformer {
    return (data: unknown) => {
      if (!Array.isArray(data)) return data;
      return data.slice(count);
    };
  }
}

// 预定义转换器组合
export const PresetTransformers = {
  // API 响应标准化
  standardizeApiResponse: ResponseTransformers.compose(
    ResponseTransformers.handleError,
    ResponseTransformers.snakeToCamel,
    ResponseTransformers.parseDate(),
    ResponseTransformers.handleNulls()
  ),

  // 表单数据准备
  prepareFormData: RequestTransformers.compose(
    RequestTransformers.removeEmpty,
    RequestTransformers.camelToSnake,
    RequestTransformers.formData
  ),

  // JSON API 请求
  prepareJsonRequest: RequestTransformers.compose(
    RequestTransformers.removeEmpty,
    RequestTransformers.camelToSnake,
    RequestTransformers.jsonStringify
  ),

  // 分页列表处理
  processPaginatedList: ResponseTransformers.compose(
    ResponseTransformers.extractPagination,
    ResponseTransformers.snakeToCamel,
    ResponseTransformers.parseDate(['created_at', 'updated_at'])
  ),
};

// 转换器工厂
export class TransformerFactory {
  static createFieldMapper(fieldMap: Record<string, string>): DataTransformer {
    return (data: unknown) => {
      if (!data || typeof data !== 'object' || Array.isArray(data)) return data;

      const mapped: Record<string, unknown> = {};
      Object.entries(data as Record<string, unknown>).forEach(
        ([key, value]) => {
          const newKey = fieldMap[key] || key;
          mapped[newKey] = value;
        }
      );
      return mapped;
    };
  }

  static createValidator(
    rules: Record<string, (value: unknown) => boolean>
  ): DataTransformer {
    return (data: unknown) => {
      if (!data || typeof data !== 'object' || Array.isArray(data)) return data;

      const dataObj = data as Record<string, unknown>;
      Object.entries(rules).forEach(([field, rule]) => {
        if (field in dataObj && !rule(dataObj[field])) {
          throw new Error(`Validation failed for field: ${field}`);
        }
      });
      return data;
    };
  }

  static createNormalizer(
    schema: Record<string, 'string' | 'number' | 'boolean' | 'date'>
  ): DataTransformer {
    return (data: unknown) => {
      if (!data || typeof data !== 'object' || Array.isArray(data)) return data;

      const normalized: Record<string, unknown> = {
        ...(data as Record<string, unknown>),
      };
      Object.entries(schema).forEach(([field, type]) => {
        if (field in normalized) {
          const value = normalized[field];
          switch (type) {
            case 'string':
              normalized[field] = String(value);
              break;
            case 'number':
              normalized[field] = Number(value);
              break;
            case 'boolean':
              normalized[field] = Boolean(value);
              break;
            case 'date':
              normalized[field] = new Date(value as string);
              break;
          }
        }
      });
      return normalized;
    };
  }
}
