import { $ } from "zx";

const initialPwd = $.sync`pwd`.text();

export const getRoot = () => {
  const root = path.join(initialPwd, "..", "..");
  return root;
};

export const cwdAtRoot = () => {
  const root = getRoot();
  $.cwd = root;
};
