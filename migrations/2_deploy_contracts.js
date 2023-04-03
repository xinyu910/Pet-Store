var Adoption = artifacts.require("Adoption");
var PetShop = artifacts.require("PetShop");

module.exports = function(deployer) {
  deployer.deploy(Adoption);
  deployer.deploy(PetShop);
};