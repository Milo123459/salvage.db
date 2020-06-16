const { task, series, run, utils } = require("lakesjs");
const prettier = task("prettier", "Prettify code", () => {
  require("child_process").execSync("prettier --write .");
});
series(prettier)