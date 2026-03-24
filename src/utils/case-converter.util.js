import { snakeCase, camelCase } from 'change-case';

export const convertKeys = (obj, converter, exclude = []) => {
  if (Array.isArray(obj)) {
    //데이터가 배열인 경우, 새 배열 반환
    return obj.map((value) => convertKeys(value, converter, exclude));
    //데이터가 객체인 경우(순수객체?)
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      //현재 키가 제외 목록에 있는지 확인
      const isExclude = exclude.includes(key);
      //key 추출 후 새로운 객체로 재구성
      const newKey = isExclude ? key : converter(key);
      //새 key가 객체나 배열일 수 있으므로 깊은 converter
      result[newKey] = convertKeys(obj[key], converter, exclude);
      //데이터가 기본타입이라 변환 필요없는 경우
      return result;
    }, {});
  }
  return obj;
};

export const toSnake = (obj, exclude = []) =>
  convertKeys(obj, snakeCase, exclude);
export const toCamel = (obj, exclude = []) =>
  convertKeys(obj, camelCase, exclude);
