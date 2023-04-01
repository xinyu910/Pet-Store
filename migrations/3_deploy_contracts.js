var PetShop = artifacts.require("PetShop");

module.exports = function(deployer) {
  PetShop.deploy(PetShop);
};