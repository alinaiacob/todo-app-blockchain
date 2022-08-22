const TaskContract = artifacts.require("TaskContract");
// 0xA790DC7e8997AA0747E89919412f1cC658571922
module.exports = function (deployer) {
  deployer.deploy(TaskContract);
};
