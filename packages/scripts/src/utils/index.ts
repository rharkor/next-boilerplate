import { $ } from "zx";

export const getRoot = () => {
  const dir = $.sync`pwd`.text();
  const root = path.join(dir, "..", "..");
  return root;
};

export const cwdAtRoot = () => {
  const root = getRoot();
  $.cwd = root;
};
