// class filter {
//   constructor() {
//     this.lowerAge;
//     this.higherAge;
//     this.lowerPrice;
//     this.higherPrice;
//     //0 is sold or adopted, 1 is avaliable, -1 means no restriction
//     this.isSold;
//   }
// }
// var filterInstance = new filter()
App = {
  web3Provider: null,
  contracts: {},

  init: async function () {
    return await App.initWeb3();
  },

  initWeb3: async function () {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
      App.web3Provider = web3.currentProvider;
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('HTTP://127.0.0.1:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function () {
    $.getJSON('PetShop.json', function (data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var PetShopArtifact = data;
      App.contracts.PetShop = TruffleContract(PetShopArtifact);

      // Set the provider for our contract
      App.contracts.PetShop.setProvider(App.web3Provider);
      App.loadPages();
      App.renderProduct();
      return App.bindEvents();
      // return App.loadPages();
    });
  },

  loadPages: async function () {
    let petsRow = $('#petsRow');
    petsRow.empty();
    let petTemplate = $('#petTemplate');
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      let account = accounts[0];
      App.contracts.PetShop.deployed().then(function (instance) {
        instance.getFilters().then(function (filters) {
          var c1, c2, c3, lowerAge, higherAge, lowerPrice, higherPrice, isSold;
          let filterDiv = $('#filterShow');
          filterDiv.find('.filterAge').text('Age: 0-3');
          filterDiv.find('.filterPrice').text('Price: 0-0.1');
          filterDiv.find('.filterStatus').text('Status: Avalible');
          c1 = parseInt(filters[0]);
          c2 = parseInt(filters[1]);
          c3 = parseInt(filters[2]);
          if (c1 === 0){
            filterDiv.find('.filterAge').text('Age: Any');
          }
          else if(c1 === 1){
            filterDiv.find('.filterAge').text('Age: 0-3');
          }
          else if(c1 === 2){
            filterDiv.find('.filterAge').text('Age: 3-5');
          }
          else if(c1 === 3){
            filterDiv.find('.filterAge').text('Age: 5-8');
          }
          else{
            filterDiv.find('.filterAge').text('Age: >8');
          }

          if (c2 === 0){
            filterDiv.find('.filterPrice').text('Price: Any');
          }
          else if(c2 === 1){
            filterDiv.find('.filterPrice').text('Price: 0-0.1');
          }
          else if(c2 === 2){
            filterDiv.find('.filterPrice').text('Price: 0.1-0.5');
          }
          else{
            filterDiv.find('.filterPrice').text('Price: >0.5');
          }

          if (c3 === 0){
            filterDiv.find('.filterStatus').text('Status: Any');
          }
          else if(c3 === 1){
            filterDiv.find('.filterStatus').text('Status: Avaliable');
          }
          else{
            filterDiv.find('.filterStatus').text('Status: Adopted or Sold');
          }

          if (parseInt(filters[3])===-1){
            lowerAge = Number.NEGATIVE_INFINITY; 
          }
          else{
            lowerAge = parseInt(filters[3]); 
          }

          if (parseInt(filters[4])===-1){
            higherAge = Number.POSITIVE_INFINITY; 
          }
          else{
            higherAge = parseInt(filters[4]); 
          }

          if (parseInt(filters[5])===-1){
            lowerPrice = Number.NEGATIVE_INFINITY; 
          }
          else{
            lowerPrice = parseInt(filters[5]); 
          }

          if (parseInt(filters[6])===-1){
            higherPrice = Number.POSITIVE_INFINITY; 
          }
          else{
            higherPrice = parseInt(filters[6]); 
          }
          isSold = parseInt(filters[7]);

          instance.getCount().then(function (petsNum) {
            let count = parseInt(petsNum);
            console.log(count, 'count');
            let array = [...Array(count).keys()];
            array.forEach(i => {
              instance.getPetDetails(i + 1).then(function (pet) {
                petTemplate.find('.panel-title').text(pet[1]);
                petTemplate.find('img').attr('src', pet[5]);
                petTemplate.find('.pet-breed').text(pet[3]);
                petTemplate.find('.pet-age').text(parseInt(pet[2]));
                petTemplate.find('.pet-location').text(pet[4]);
                let x = BigInt("100000000000000");
                let price = Number(BigInt(pet[6]) / x) / 10000;
                if (price > 0) {
                  petTemplate.find('.btn-buy').show();
                  petTemplate.find('.btn-adopt').hide();
                  petTemplate.find('.btn-buy').attr('data-id', pet[0]);
                  if (pet[7] === true) {
                    petTemplate.find('.btn-buy').text('Sold').attr('disabled', true);
                  } else {
                    petTemplate.find('.btn-buy').text('Buy').attr('disabled', false);
                  }
                } else {
                  petTemplate.find('.btn-adopt').show();
                  petTemplate.find('.btn-buy').hide();
                  petTemplate.find('.btn-adopt').attr('data-id', pet[0]);
                  console.log(pet[7]);
                  if (pet[7] === true) {
                    petTemplate.find('.btn-adopt').text('Adopted').attr('disabled', true);
                  } else {
                    petTemplate.find('.btn-adopt').text('Adopt').attr('disabled', false);
                  }
                }
                petTemplate.find('.pet-price').text(price);

                priceForFilter = price*10;
                console.log(c1, c2, c3, lowerAge, higherAge, lowerPrice, higherPrice, isSold, 'load');
                console.log(count, 'count');
                var flagShow = true;
                if (parseInt(pet[2]) > higherAge || parseInt(pet[2]) < lowerAge){
                  flagShow = false;
                }
                else if (priceForFilter > higherPrice || priceForFilter < lowerPrice){
                  flagShow = false;
                }

                if (isSold !== -1){
                  if (isSold === 0 && pet[7] === true){
                    flagShow = false;
                  }
                  else if (isSold === 1 && pet[7] === false){
                    flagShow = false;
                  }
                }
                if (flagShow === true){
                  petsRow.append(petTemplate.html());
                }
              });
            });
          });
        });
      });
    });
  },

  bindEvents: function () {
    console.log("bind");
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on('click', '.btn-buy', App.handleBuy);
    $(document).on('submit', '.add-form', App.handleRegistration);
    $(document).on('click', '.plus', App.handleAdd);
    $(document).on('click', '.minus', App.handleMinus);
    $(document).on('click', '.btn-buy-product', App.handleBuyProduct);
    $(document).on('click', '.filter', App.handleFilterPets);
    $(document).on('click', '.resetFilter', App.handleFilterPetsReset);
  },

  handleFilterPets: function (event) {
    event.preventDefault();
    var condition1 = $('#condition1').val();
    var condition2 = $('#condition2').val();
    var condition3 = $('#condition3').val();
    var lowerAge, higherAge, lowerPrice, higherPrice, isSold;

    if (condition1 === '1') {
      lowerAge = 0;
      higherAge = 3;
    }
    else if (condition1 === '2') {
      lowerAge = 3;
      higherAge = 5;
    }
    else if (condition1 === '3') {
      lowerAge = 5
      higherAge = 8;
    }
    else if (condition1 === '4') {
      lowerAge = 8;
      higherAge = -1;
    }
    else {
      lowerAge = -1;
      higherAge = -1;
    }

    if (condition2 === '1') {
      lowerPrice = 0;
      higherPrice = 1;
    }
    else if (condition2 === '2') {
      lowerPrice = 1;
      higherPrice = 5;
    }
    else if (condition2 === '3') {
      lowerPrice = 5;
      higherPrice = -1;
    }
    else {
      lowerPrice = -1;
      higherPrice = -1;
    }

    if (condition3 === '1') {
      isSold = 0;
    }
    else if (condition3 === '2') {
      isSold = 1;
    }
    else {
      isSold = -1;
    }

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      let account = accounts[0];
      App.contracts.PetShop.deployed().then(function (instance) {
        petShopInstance = instance;
        console.log(condition1*1, condition2*1, condition3*1, lowerAge, higherAge, lowerPrice, higherPrice, isSold);
        return petShopInstance.setFilters(condition1*1, condition2*1, condition3*1, lowerAge, higherAge, lowerPrice, higherPrice, isSold, { from: account, value: 0 });
      }).then(function (result) {
        window.location.reload();
      }).catch(function (err) {
        console.log(err.message);
      });
    })

    // filterInstance.lowerAge = lowerAge;
    // filterInstance.higherAge = higherAge;
    // filterInstance.lowerPrice = lowerPrice;
    // filterInstance.higherPrice = higherPrice;
    // filterInstance.isSold = isSold;
    // console.log(filterInstance.lowerAge, filterInstance.higherAge, filterInstance.lowerPrice, filterInstance.higherPrice, isSold, 'filter');
    // let filterDiv = $('#filter');
    // filterDiv.find('.lowerAge').text(lowerAge);
    // filterDiv.find('.higherAge').text(higherAge);
    // filterDiv.find('.lowerPrice').text(lowerPrice);
    // filterDiv.find('.higherPrice').text(higherPrice);
    // filterDiv.find('.isSold').text(isSold);
    // console.log(filterDiv.find('.lowerAge').text())
    // window.location.reload(); 
  },

  handleFilterPetsReset: function (event) {
    event.preventDefault();
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      let account = accounts[0];
      App.contracts.PetShop.deployed().then(function (instance) {
        petShopInstance = instance;
        return petShopInstance.setFilters(0, 0, 0, -1, -1, -1, -1, -1, { from: account, value: 0 });
      }).then(function (result) {
        window.location.reload();
      }).catch(function (err) {
        console.log(err.message);
      });
    })
  },

  handleAdd: function (event) {
    let pId = parseInt($(event.target).data('id'));
    let plusObj = $('.panel-product').eq(pId).find('.count');
    plusObj.text(parseInt(plusObj.text()) + 1);

  },
  handleMinus: function (event) {
    let pId = parseInt($(event.target).data('id'));
    let minusObj = $('.panel-product').eq(pId).find('.count');
    minusObj.text(parseInt(minusObj.text()) - 1);
    if (minusObj.text() * 1 == 0) {
      minusObj.text(1);
    }
  },
  handleBuyProduct: function (event) {
    let pId = parseInt($(event.target).data('id'));
    let amount = $('.panel-product').eq(pId).find('.count').text() * 1;
    web3.eth.getAccounts(function (error, accounts) {

      if (error) {
        console.log(error);
      }
      let account = accounts[0];
      App.contracts.PetShop.deployed().then(function (instance) {
        petShopInstance = instance;
        return petShopInstance.getProductPrice(pId);
      }).then(function (price) {
        console.log(price);
        let pPrice = price * 10 ** 12 * amount;
        return petShopInstance.buyProduct(pId, amount, { from: account, value: pPrice });
      }).then(function (result) {
        window.location.reload();
        // window.location.replace("goods.html");
      }).catch(function (err) {
        console.log(err.message);
      });
    })
  },

  renderProduct: async function () {
    var productsRow = $('#productsRow');
    productsRow.empty();
    var productTemplate = $('#productTemplate');
    // var account = await web3.eth.getAccounts();
    var instance = await App.contracts.PetShop.deployed();
    var productNum = await instance.getProductCount();
    for (var i = 0; i < productNum; i++) {
      var data = await instance.getProductDetails(i);
      // console.log(i);
      // console.log(data[0]);
      productTemplate.find('.panel-title').text(data[1]);
      productTemplate.find('img').attr('src', data[4]);
      productTemplate.find('.product-category').text(data[2]);
      productTemplate.find('.product-brand').text(data[3]);
      productTemplate.find('.product-name').text(data[1]);
      productTemplate.find('.product-price').text(data[5] / 1000000);
      productTemplate.find('.product-stock').text(data[6]);
      productTemplate.find('.btn-buy-product').attr('data-id', data[0]);
      productTemplate.find('.plus').attr('data-id', data[0]);
      productTemplate.find('.minus').attr('data-id', data[0]);
      productTemplate.find('.count').text("1");
      productTemplate.find('.panel-product').attr('data-id', data[0]);
      productsRow.append(productTemplate.html());
    }
    /** 
    var account = web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      App.contracts.PetShop.deployed().then(function (instance) {
        instance.getProductCount().then(function (productNum) {
          [...new Array(productNum * 1).keys()].forEach(i => {
            // console.log(i);
            instance.getProductDetails(i).then(function (data) {
              console.log(i);
              console.log(data[0]);
              productTemplate.find('.panel-title').text(data[1]);
              productTemplate.find('img').attr('src', data[4]);
              productTemplate.find('.product-category').text(data[2]);
              productTemplate.find('.product-brand').text(data[3]);
              productTemplate.find('.product-name').text(data[1]);
              productTemplate.find('.product-price').text(data[5] / 1000000);
              productTemplate.find('.product-stock').text(data[6]);
              productTemplate.find('.btn-buy-product').attr('data-id', data[0]);
              productTemplate.find('.plus').attr('data-id', data[0]);
              productTemplate.find('.minus').attr('data-id', data[0]);
              productTemplate.find('.count').text("1");
              productTemplate.find('.panel-product').attr('data-id', data[0]);
              productsRow.append(productTemplate.html());
            });
          });
        });
      });
    });
    */
  },

  handleAdopt: function (event) {
    event.preventDefault();
    var petId = parseInt($(event.target).data('id'));
    var petShopInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.PetShop.deployed().then(function (instance) {
        petShopInstance = instance;
        // Execute adopt as a transaction by sending account
        return petShopInstance.adopt(petId, { from: account });
      }).then(function (result) {
        window.location.reload();
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },

  handleBuy: function (event) {
    event.preventDefault();
    var petId = parseInt($(event.target).data('id'));
    var petShopInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.PetShop.deployed().then(function (instance) {
        petShopInstance = instance;
        // Execute buy as a transaction by sending account
        return petShopInstance.getPrice(petId);
      }).then(function (amount) {
        return petShopInstance.buyPet(petId, { from: account, value: amount });
      }).then(function (result) {
        window.location.reload();
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },

  /////////REGISTERATION /////////////
  registerPets: function (newData) { //input new pet object data
    var petShopInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];

      const reader = new FileReader();
      reader.onloadend = function () {
        const ipfs = window.IpfsApi('localhost', 5001)
        const buf = buffer.Buffer(reader.result)
        ipfs.files.add(buf, (err, result) => {
          if (err) {
            console.error(err)
            return
          }
          var url = `https://ipfs.io/ipfs/${result[0].hash}`;

          App.contracts.PetShop.deployed().then(function (instance) {
            petShopInstance = instance;
            let price = BigInt(newData.price * 10000);
            price = price * 100000000000000n;
            return petShopInstance.registerPet(newData.name, parseInt(newData.age),
              newData.breed, newData.location, url, price, "10000000000000000", { from: account, gas: 320000, value: "10000000000000000" });
          }).then(function (result) {
            alert("Added Successfully!");
            return petShopInstance.getCount.call();
          }).then(function (result) {
            //not working here, reload should be in the load page (filter)
            //App.renderNewPet(newData,result);
            window.location.replace("pets.html");
          }).catch(function (err) {
            console.log(err.message);
          });
        })
      }
      const petPic = document.getElementById("photo");
      reader.readAsArrayBuffer(petPic.files[0]);
    })
  },

  handleRegistration: function (event) {
    event.preventDefault();
    //check if the form is filled
    let cur_age = parseInt(document.querySelector('#age').value);
    let cur_name = document.querySelector('#name').value;
    let cur_breed = document.querySelector('#breed').value;
    let cur_location = document.querySelector('#location').value;
    let cur_photo = document.querySelector('#photo').value;
    let cur_sale_value = document.querySelector('#sale').value;
    let cur_price = parseFloat(document.querySelector('#price').value).toFixed(2);
    if ((cur_age.length == 0 || cur_age < 0 || cur_name.length == 0 || cur_breed.length == 0 ||
      cur_location.length == 0 || cur_photo.length == 0 || cur_price < 0)) {
      alert("Please enter all the field values");
    }
    let isForSale;
    if (cur_sale_value == 'adoption') {
      cur_price = 0;
      isForSale = false;
    }
    var Pet = {
      age: cur_age,
      breed: cur_breed,
      name: cur_name,
      location: cur_location,
      picture: cur_photo,
      isForSale: isForSale,
      price: cur_price
    }
    return App.registerPets(Pet);
  }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
