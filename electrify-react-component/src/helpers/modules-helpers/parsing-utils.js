import jsonTree from "./json-tree";

export const bundle = function (modules, callback) {
  let data = {mode: "size"};
  data = JSON.stringify(jsonTree(modules));
  return callback({data});
};
