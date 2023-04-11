const PetShop = artifacts.require("PetShop");
const Web3Utils = require('web3-utils');

//JavaScript describe it test, before() is run once before all the tests in a describe

contract("PetShop", (accounts) => {
  let petshop;
  let originalPetCount;
  let originalProductCount;

  before(async () => {
      petshop = await PetShop.deployed();
      originalPetCount = parseInt(await petshop.getCount());
      originalProductCount = parseInt(await petshop.getProductCount());
      //await petshop.registerPet("Tish", 2, "Shiba Inu", "Toronto, ON", "an example photo url", web3.utils.toWei("0.01", "ether"), web3.utils.toWei("0.0001", "ether"), {from: accounts[0], value: web3.utils.toWei("0.0001", "ether")});
      await petshop.registerPet("Tish", 2, "Male","Shiba Inu", "Toronto, ON", "an example photo url", "10000000000000000", "100000000000000", {from: accounts[0], value: "100000000000000"});
      await petshop.addProduct("product_name", "Suppliers", "Essentials" ,"product photo url",100000 , 100, {from: accounts[0], value: "100000000000000"});
  });

  describe("register a new pet using account[0] and validate pet information", async () => {
    it("can return the correct petId", async () => {
      const petCount = await petshop.getCount();
      assert.equal(parseInt(petCount), originalPetCount+1, "The pet count should increment by 1.");
    });

    it("can fetch the added pet infomation correctly", async () => {
        const pet = await petshop.getPetDetails(originalPetCount+1);
        assert.equal(pet[1], "Tish", "The pet name matches the input one.");
        assert.equal(parseInt(pet[2]), 2, "The pet age matches the input one.");
        assert.equal(pet[9], "Male", "The pet Sex matches the input one.");
        assert.equal(pet[3], "Shiba Inu", "The pet breed matches the input one.");
        assert.equal(pet[4], "Toronto, ON", "The pet location matches the input one.");
        assert.equal(pet[5], "an example photo url", "The pet photo matches the input one");
        assert.equal(web3.utils.toBN(pet[6]).toString(), '10000000000000000', "The pet price matches the input one.");
        assert.equal(pet[7], false, "The pet should be marked as unsold.");
    });
  });

  describe("add a new product using account[0] and validate product information", async () => {
    it("can return the correct productId", async () => {
      const productCount = await petshop.getProductCount();
      assert.equal(parseInt(productCount), originalProductCount+1, "The product count should increment by 1.");
    });

    it("can fetch the added product infomation correctly", async () => {
        const product = await petshop.getProductDetails(originalProductCount);
        assert.equal(product[1], "product_name", "The product name matches the input one.");
        assert.equal(product[2], "Suppliers", "The product category matches the input one.");
        assert.equal(product[3], "Essentials", "The product brand matches the input one.");
        assert.equal(product[4], "product photo url", "The product photo matches the input one.");
        assert.equal(product[5], 100000, "The product price matches the input one");
        assert.equal(product[6], 100, "The product stock matches the input one.");
    });
  });

  describe("buy the registered pet", async () => {
    before("buy the pet named Tish", async () => {
      await petshop.buyPet(originalPetCount+1, {from: accounts[0], value: "10000000000000000"});
    });
  
    it("can fetch the address of an owner by pet id, the isSold has been flagged", async () => {
      const pet = await petshop.getPetDetails(originalPetCount+1);
      assert.equal(pet[8], accounts[0], "The owner of the bought pet should be the first account.");
      assert.equal(pet[7], true, "The pet should be marked as sold.");
    });
  });

  describe("register a new pet and adopt it", async () => {
    before("register and adopt the pet", async () => {
      await petshop.registerPet("Cecilia", 3, "Male","German Shepherd", "Vancouver, BC", "an example photo url", 0, "100000000000000", {from: accounts[0], value: "100000000000000"});
      await petshop.adopt(originalPetCount+2, {from: accounts[0]});
    });
  
    it("can fetch the address of an owner by pet id, the isSold has been flagged", async () => {
      const pet = await petshop.getPetDetails(originalPetCount+2);
      assert.equal(pet[8], accounts[0], "The owner of the adopted pet should be the first account.");
      assert.equal(pet[7], true, "The pet should be marked as adopted/sold.");
    });
  });

  describe("buy the product", async () => {
    before("buy product", async () => {
      await petshop.buyProduct(originalProductCount, 2,{from: accounts[0], value: "10000000000000000"});
    });
  
    it("can substract the stock by product id", async () => {
      const product = await petshop.getProductDetails(originalProductCount);
      assert.equal(product[6], 98, "The stock of the specific product should be 98.");
    });
  });


});