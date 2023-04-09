App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
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

  initContract: function() {
    $.getJSON('PetShop.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var PetShopArtifact = data;
      App.contracts.PetShop = TruffleContract(PetShopArtifact);
    
      // Set the provider for our contract
      App.contracts.PetShop.setProvider(App.web3Provider);
      
      return App.loadPages();
    });
  },

  loadPages: async function() { 
    let petsRow = $('#petsRow');
    let petTemplate = $('#petTemplate');
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      let account = accounts[0];
      App.contracts.PetShop.deployed().then(function(instance) {
        instance.getCount().then(function(petsNum) {
          let count = parseInt(petsNum);
          let array = [...Array(count).keys()];
          array.forEach(i => {
            instance.getPetDetails(i+1).then(function(pet){
              petTemplate.find('.panel-title').text(pet[1]);
              petTemplate.find('img').attr('src', pet[5]);
              petTemplate.find('.pet-sex').text(pet[9]);
              petTemplate.find('.pet-breed').text(pet[3]);
              petTemplate.find('.pet-age').text(parseInt(pet[2]));
              petTemplate.find('.pet-location').text(pet[4]);
              let x = BigInt("100000000000000");
              let price = Number(BigInt(pet[6])/x)/10000;
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
                if (pet[7] === true) {
                  petTemplate.find('.btn-adopt').text('Adopted').attr('disabled', true);
                } else {
                  petTemplate.find('.btn-adopt').text('Adopt').attr('disabled', false);
                }
              }
              petTemplate.find('.pet-price').text(price);

              petsRow.append(petTemplate.html());
            });
          });
        });
      });
    });
    return App.bindEvents();
  },

  filterUnsold: function() {
    console.log("mark");
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on('click', '.btn-buy', App.handleBuy);
    $(document).on('submit', '.add-form', App.handleRegistration);
  },

  handleAdopt: function(event) {
    event.preventDefault();
    var petId = parseInt($(event.target).data('id'));
    var petShopInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.PetShop.deployed().then(function(instance) {
        petShopInstance = instance;
        // Execute adopt as a transaction by sending account
        return petShopInstance.adopt(petId, {from: account});
      }).then(function(result) {
        window.location.reload();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleBuy: function(event) {
    event.preventDefault();
    var petId = parseInt($(event.target).data('id'));
    var petShopInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.PetShop.deployed().then(function(instance) {
        petShopInstance = instance;
        // Execute buy as a transaction by sending account
        return petShopInstance.getPrice(petId);
      }).then(function(amount) {
        return petShopInstance.buyPet(petId, {from: account, value: amount});
      }).then(function(result) {
        window.location.reload();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  /////////REGISTERATION /////////////
  registerPets: function(newData){ //input new pet object data
    var petShopInstance;
    web3.eth.getAccounts(function(error, accounts) {
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

          App.contracts.PetShop.deployed().then(function(instance) {
            petShopInstance = instance;
            let price = BigInt(newData.price*10000);
            price = price * 100000000000000n;
            return petShopInstance.registerPet(newData.name, parseInt(newData.age), newData.sex,
                newData.breed, newData.location, url, price, "10000000000000000", { from: account, gas: 320000, value: "10000000000000000"});
          }).then(function(result) {
            alert("Added Successfully!");
            return petShopInstance.getCount.call();
          }).then(function(result){
            //not working here, reload should be in the load page (filter)
            //App.renderNewPet(newData,result);
            window.location.replace("pets.html");
          }).catch(function(err) {
            console.log(err.message);
          });
        })
      }
      const petPic = document.getElementById("photo");
      reader.readAsArrayBuffer(petPic.files[0]);
    })
  },

  handleRegistration: function(event) {
    event.preventDefault();
    //check if the form is filled
    let cur_age = parseInt(document.querySelector('#age').value);
    let cur_name = document.querySelector('#name').value;
    let cur_sex = document.querySelector('#sex').value;
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
      sex: cur_sex,
      location: cur_location,
      picture: cur_photo,
      isForSale: isForSale,
      price: cur_price
    }
    return App.registerPets(Pet);
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
