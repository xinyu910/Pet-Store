App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        if (data[i].price > 0) {
          petTemplate.find('.btn-buy').show();
          petTemplate.find('.btn-adopt').hide();
          petTemplate.find('.btn-buy').attr('data-id', data[i].id);
        } else {
          petTemplate.find('.btn-adopt').show();
          petTemplate.find('.btn-buy').hide();
          petTemplate.find('.btn-adopt').attr('data-id', data[i].id);
        }
        petTemplate.find('.pet-price').text(data[i].price/10e17);

        petsRow.append(petTemplate.html());
      }
    });

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
    
      return App.initContractData();
    });
  },

  initContractData: async function() {
    //initialize contract data
    $.getJSON('../pets.json', function(data) {
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];
        data.forEach(function(item, i) {
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
              console.log(url);

              App.contracts.PetShop.deployed().then(function(instance) {
                petShopInstance = instance;
                return petShopInstance.registerPet(item.name, parseInt(item.age),
                item.breed, item.location, url, item.price, 0, {from: account, gas: 320000});
              }).then(function(result) {
                return App.filterUnsold();
              }).catch(function(err) {
                console.log(err.message);
              });
            })
          }
          const file = fetch(item.picture).then(function(response) {
            return response.blob().then(function(response) {
              return new File([response], "result.jpeg", {
                type: response.type || 'image/jpeg',
              })
            })
          });

          const getFile = () => {
            file.then((a) => {
              reader.readAsArrayBuffer(a);
            });
          };
          getFile();
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
    $(document).on('click', '.add-pet', handleAdd);
  },

  handleAdd: function(event) {
    event.preventDefault();
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
        $('.panel-pet').eq(petId).find('.btn-adopt').text('Success').attr('disabled', true);
        return App.filterUnsold();
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
        return petShopInstance.buyPet(petId, {from: account, value: 1e17});
      }).then(function(result) {
        $('.panel-pet').eq(petId).find('.btn-buy').text('Success').attr('disabled', true);
        return App.filterUnsold();
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
            return petShopInstance.registerPet(newData.name, parseInt(newData.age),
                newData.breed, newData.location, url, newData.price, 0, { from: account, gas: 320000 });
          }).then(function(result) {
            alert("Added Successfully!");
          }).then(function(result){
            console.log("result", result);
            var petsRow = $('#petsRow');
            var petTemplate = $('#petTemplate');
            petTemplate.find('.panel-title').text(newData.name);
            petTemplate.find('img').attr('src', newData.picture);
            petTemplate.find('.pet-breed').text(newData.breed);
            petTemplate.find('.pet-age').text(newData.age);
            petTemplate.find('.pet-location').text(newData.location);
            if (newData.price > 0) {
              petTemplate.find('.btn-buy').show();
              petTemplate.find('.btn-adopt').hide();
              petTemplate.find('.btn-buy').attr('data-id', result);
            } else {
              petTemplate.find('.btn-adopt').show();
              petTemplate.find('.btn-buy').hide();
              petTemplate.find('.btn-adopt').attr('data-id', result);
            }
            petTemplate.find('.pet-price').text(newData.price);

            petsRow.append(petTemplate.html());
            window.location.replace("index.html");
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

$(function() {
  $(window).load(function() {
    App.init();
  });
});