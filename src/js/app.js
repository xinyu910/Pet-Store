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
      var condition1 = sessionStorage.getItem('condition1');
      var condition2 = sessionStorage.getItem('condition2');
      var condition3 = sessionStorage.getItem('condition3');
      var condition4 = sessionStorage.getItem('condition4');
      if (condition1 === null && condition2 === null && condition3 === null && condition4 === null) {
        App.loadPages("0", "0", "0", "0");
      } else {
        console.log(condition1, condition2, condition3, condition4);
        $('#condition1').val(condition1);
        $('#condition2').val(condition2);
        $('#condition3').val(condition3);
        $('#condition4').val(condition4);
        App.loadPages(condition1, condition2, condition3, condition4);
      }

      App.renderProduct();
      return App.bindEvents();
    });
  },
  loadPages: async function (condition1, condition2, condition3, condition4) {
    let petsRow = $('#petsRow');
    petsRow.empty();
    let petTemplate = $('#petTemplate');
    //change current filter
    let filterDiv = $('#filterShow');
    //current age setting
    if (condition1 === "0") {
      filterDiv.find('.filterAge').text('Age: Any');
    }
    else if (condition1 === "1") {
      filterDiv.find('.filterAge').text('Age: 0-3');
    }
    else if (condition1 === "2") {
      filterDiv.find('.filterAge').text('Age: 3-5');
    }
    else if (condition1 === "3") {
      filterDiv.find('.filterAge').text('Age: 5-8');
    }
    else {
      filterDiv.find('.filterAge').text('Age: >8');
    }
    //current price setting
    if (condition2 === "0") {
      filterDiv.find('.filterPrice').text('Price: Any');
    }
    else if (condition2 === "1") {
      filterDiv.find('.filterPrice').text('Price: <0.1');
    }
    else if (condition2 === "2") {
      filterDiv.find('.filterPrice').text('Price: 0.1-0.5');
    }
    else {
      filterDiv.find('.filterPrice').text('Price: >0.5');
    }
    //current status setting
    if (condition3 === "0") {
      filterDiv.find('.filterStatus').text('Status: Any');
    }
    else if (condition3 === "1") {
      filterDiv.find('.filterStatus').text('Status: Salable or Adoptable');
    }
    else if (condition3 === "2") {
      filterDiv.find('.filterStatus').text('Status: Salable');
    }
    else if (condition3 === "3") {
      filterDiv.find('.filterStatus').text('Status: Adoptable');
    } else {
      filterDiv.find('.filterStatus').text('Status: Adopted or Sold');
    }
    //current sex setting
    if (condition4 === "0") {
      filterDiv.find('.filterSex').text('Sex: Any');
    }
    else if (condition4 === "1") {
      filterDiv.find('.filterSex').text('Sex: Female');
    }
    else {
      filterDiv.find('.filterSex').text('Sex: Male');
    }

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      let account = accounts[0];
      App.contracts.PetShop.deployed().then(function (instance) {
        return instance.getCount().then(function (petsNum) {
          let count = parseInt(petsNum);
          console.log(count, 'count');
          let array = [...Array(count).keys()];
          array.forEach(i => {
            instance.getPetDetails(i + 1).then(function (pet) {
              petTemplate.find('.panel-title').text(pet[1]);
              petTemplate.find('.image').attr('src', pet[5]);
              petTemplate.find('.pet-sex').text(pet[9]);
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
              var flagShow = true;


              //filter age
              if (condition1 !== "0") {
                var lowerBound;
                var higherBound;
                if (condition1 === "1") {
                  lowerBound = 0;
                  higherBound = 3;
                } else if (condition1 === "2") {
                  lowerBound = 3;
                  higherBound = 5;
                } else if (condition1 === "3") {
                  lowerBound = 5;
                  higherBound = 8;
                } else {
                  lowerBound = 8;
                  higherBound = Number.POSITIVE_INFINITY;
                }
                if (pet[2] < lowerBound || pet[2] >= higherBound) {
                  flagShow = false;
                }
              }
              //filter price
              console.log(typeof (price));
              console.log(condition2, price);
              if (condition2 !== "0") {
                var lowerPrice;
                var higherPrice;
                if (condition2 === "1") {
                  lowerPrice = 0;
                  higherPrice = 0.1;
                } else if (condition2 === "2") {
                  lowerPrice = 0.1;
                  higherPrice = 0.5;
                } else {
                  lowerPrice = 0.5;
                  higherBound = Number.POSITIVE_INFINITY;
                }
                if (price < lowerPrice || price >= higherPrice) {
                  flagShow = false;
                }
              }
              //filter status
              if (condition3 !== "0") {
                if (condition3 === "1") {
                  if (pet[7]) flagShow = false;
                } else if (condition3 === "2") {
                  if (pet[7] || price == 0) flagShow = false;
                } else if (condition3 === "3") {
                  if (pet[7] || price > 0) flagShow = false;
                } else {
                  if (!pet[7]) flagShow = false;
                }
              }
              //filter sex
              if (condition4 === "1") {
                if (pet[9] !== "Female") {
                  flagShow = false;
                }
              } else if (condition4 === "2") {
                if (pet[9] !== "Male") {
                  flagShow = false;
                }
              }
              if (flagShow === true) {
                petsRow.append(petTemplate.html());
              }
            });
          });
        }).then(function (result) {
          return instance.getAdmin();
        }).then(function (admin) {
          if (admin === account) {
            $('.product-show').show();
            $('#hide-price').show();
            $('#sale-hide').show();
          }
        }).catch(function (err) {
          console.log(err.message);
        });
      });
    });
  },


  bindEvents: function () {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on('click', '.btn-buy', App.handleBuy);
    $(document).on('submit', '.add-form', App.handleRegistration);
    $(document).on('submit', '.add-product-form', App.handleAddProduct);
    $(document).on('click', '.plus', App.handleAdd);
    $(document).on('click', '.minus', App.handleMinus);
    $(document).on('click', '.btn-buy-product', App.handleBuyProduct);
    $(document).on('click', '.filter', App.filterPage);
    $(document).on('click', '.resetFilter', App.handleFilterReset);
  },
  filterPage: function () {
    sessionStorage.setItem('condition1', $('#condition1').val());
    sessionStorage.setItem('condition2', $('#condition2').val());
    sessionStorage.setItem('condition3', $('#condition3').val());
    sessionStorage.setItem('condition4', $('#condition4').val());
    window.location.reload();
  },
  handleFilterReset: function () {
    sessionStorage.setItem('condition1', "0");
    sessionStorage.setItem('condition2', "0");
    sessionStorage.setItem('condition3', "0");
    sessionStorage.setItem('condition4', "0");
    window.location.reload();
  },


  handleAdd: function (event) {
    let pId = parseInt($(event.target).data('id'));
    let plusObj = $('.panel-product').eq(pId).find('.count');
    let amount = $('.panel-product').eq(pId).find('.product-stock').text() * 1;
    plusObj.text(parseInt(plusObj.text()) + 1);
    if (plusObj.text() * 1 > amount) {
      if (amount === 0) {
        plusObj.text(1);
      } else {
        plusObj.text(amount);
      }

    }

  },
  handleMinus: function (event) {
    let pId = parseInt($(event.target).data('id'));
    let minusObj = $('.panel-product').eq(pId).find('.count');
    minusObj.text(parseInt(minusObj.text()) - 1);
    if (minusObj.text() * 1 <= 0) {
      minusObj.text(1);
    }
  },
  handleBuyProduct: function (event) {
    let pId = parseInt($(event.target).data('id'));
    let amount = $('.panel-product').eq(pId).find('.count').text() * 1;
    let stock = $('.panel-product').eq(pId).find('.product-stock').text() * 1;
    if (amount > stock) {
      alert("Stock is not enough!");
      return;
    }
    if (confirm("Are you sure?")) {
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
    }

  },

  renderProduct: async function () {
    console.log('renderProduct');
    var productsRow = $('#productsRow');
    productsRow.empty();
    var productTemplate = $('#productTemplate');
    // var account = await web3.eth.getAccounts();
    var instance = await App.contracts.PetShop.deployed();
    var productNum = await instance.getProductCount();
    console.log('productNum:', productNum);
    for (var i = 0; i < productNum; i++) {
      var data = await instance.getProductDetails(i);
      productTemplate.find('.panel-title').text(data[1]);
      productTemplate.find('.image').attr('src', data[4]);
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
  handleAddProduct: function (event) {
    event.preventDefault();
    //check if the form is filled
    let product_name = document.querySelector('#product_name').value;
    let product_stock = document.querySelector('#product_stock').value * 1;
    let product_category = document.querySelector('#product_category').value;
    let product_brand = document.querySelector('#product_brand').value;
    let product_photo = document.querySelector('#product_photo').value;
    let product_price = parseFloat(document.querySelector('#product_price').value).toFixed(3);
    if ((product_name.length == 0 || product_stock < 0 || product_brand.length == 0 ||
      product_category.length == 0 || product_photo.length == 0 || product_price < 0)) {
      alert("Please enter all the field values");
    }
    var Product = {
      name: product_name,
      brand: product_brand,
      stock: product_stock,
      categoty: product_category,
      photo: product_photo,
      price: product_price
    }
    console.log(product_name, product_brand, product_stock, product_category, product_photo, product_price);
    return App.registerProduct(Product);

  },
  registerProduct: function (product) {
    var petShopInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      console.log(account);
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
            let price = product.price * 1000000;
            return petShopInstance.addProduct(product.name, product.categoty, product.brand, url, price, product.stock, { from: account, gas: 320000});
          }).then(function (result) {
            alert("Added Successfully!");
            return petShopInstance.getProductCount.call();
          }).then(function (result) {
            window.location.replace("goods.html");
          }).catch(function (err) {
            console.log(err.message);
          });
        })
      }
      const productPhoto = document.getElementById("product_photo");
      reader.readAsArrayBuffer(productPhoto.files[0]);
    })
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
            return instance.getAdmin();
          }).then(function (admin) {
            let price = BigInt(newData.price * 10000);
            price = price * 100000000000000n;
            if (admin === account) {
              return petShopInstance.registerPetAdmin(newData.name, parseInt(newData.age), newData.sex,
              newData.breed, newData.location, url, price, {from: account, gas: 320000});
            } else {
              return petShopInstance.registerPet(newData.name, parseInt(newData.age), newData.sex,
              newData.breed, newData.location, url, price, "10000000000000000", { from: account, gas: 320000, value: "10000000000000000" });
            }
          }).then(function (result) {
            alert("Added Successfully!");
            return petShopInstance.getCount.call();
          }).then(function (result) {
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
    let cur_age = parseInt(Math.round(document.querySelector('#age').value));
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

$(function () {
  $(window).load(function () {
    App.init();
  });
});
