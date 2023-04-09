pragma solidity >=0.4.22 <0.9.0;

contract PetShop {
    address public owner;

    //struct of a pet's info, picture = ipfs url
    struct Pet {
        uint id;
        string name;
        uint age;
        string breed;
        string location;
        string photo;
        uint price;
        bool isSold;
        address owner;
    }
    
    struct Product {
        uint pId;
        string pName;
        string pCategory;
        string pBrand;
        string picture;
        uint pPrice;
        uint stock;
    }

    struct filter {
      int conditionAge;
      int conditionPrice;
      int conditionStatus;
      int lowerAge;
      int higherAge;
      int lowerPrice;
      int higherPrice;
      int isSold;
    }

    mapping(uint => Pet) public pets;
    mapping(uint => Product) public products;
    mapping(uint => filter) public filters;

    uint public petCount;
    uint public productCount;
    uint public filterCount;

    constructor() public {
        petCount = 0;
        productCount = 0;
        filterCount =0;
        owner = msg.sender;
        addProduct("Lamb & Brown Rice Recipe Dog Food","Food&Treats","Performatrin","images/product1.jpg",1*100000,1000);
        addProduct("Homestead Harvest Adult Cat Food","Food&Treats","ACANA","images/product2.jpg",2*100000,1000);
        addProduct("Grey & White Hooded Litter Box","Litter&Accessories","Savic","images/product3.jpg",2*100000,1000);
        addProduct("Giant Litter Scoop","Litter&Accessories","Van Ness","images/product4.jpg",2*100000,1000);
        addProduct("NatureMates Bird Teaser","Supplies","Jump","images/product5.jpg",2*100000,1000);
        addProduct("Felix Hammock Cat Condo","Supplies","Jump","images/product6.jpg",2*100000,1000);
        addProduct("Wellness exams","Service","Pet Good Life","images/product7.jpg",2*100000,1000);
        addProduct("Vaccinations","Service","Pet Good Life","images/product8.jpg",2*100000,1000);
        addProduct("Teeth cleaning and dentistry","Service","Pet Good Life","images/product9.jpg",2*100000,1000);
        setFilters(0,0,0,-1,-1,-1,-1,-1);
    }

    function addProduct(string memory pName, string memory pCategory, string memory pBrand, string memory picture, uint pPrice, uint stock) public returns (uint){
        require (pPrice > 0,"unsatisfied price");
        require (stock >= 0,"unsatisfied stock");
        products[productCount] = Product(productCount, pName, pCategory, pBrand, picture, pPrice, stock);
        return productCount++;
    }
    

    function registerPet(string memory _name, uint _age, string memory _breed, 
    string memory _location, string memory _photo, uint _price, uint _fee) public payable returns (uint) {
        require(msg.value >= _fee, "Insufficient fee");
        petCount++;
        pets[petCount] = Pet(petCount, _name, _age, _breed, _location, _photo, _price, false, address(0));
        return petCount;
    }

    function buyPet(uint _id) external payable {
        require(_id >= 0 && _id<= petCount);
        Pet storage pet = pets[_id];
        require(!pet.isSold, "This pet is already sold");
        require(msg.value >= pet.price, "Insufficient funds");
        pet.isSold = true;
        pet.owner = msg.sender;
    }
    function buyProduct(uint pId, uint amount) external payable {
        require(pId >= 0 && pId <= productCount);
        Product storage product = products[pId];
        require(product.stock-amount >= 0, "Stock not enough");
        require(msg.value >= product.stock * product.pPrice, "Insufficient funds");
        product.stock -= amount;
    }

    function adopt(uint _id) external returns (uint) {
        require(_id >= 0 && _id <= petCount);
        Pet storage pet = pets[_id];
        require(!pet.isSold, "This pet is already adpoted");
        pet.isSold = true;
        pet.owner = msg.sender;
        return _id;
    }

    function getCount() view external returns (uint) {
        return petCount;
    }
    function getProductCount() view external returns (uint){
        return productCount;
    }

    // Retrieving one pet's details
    function getPetDetails(uint petId) public view returns (uint, string memory, uint, string memory, string memory,
        string memory, uint, bool, address) {
        require(petId >= 0 && petId <= petCount);
        Pet storage p = pets[petId];
        return (p.id, p.name, p.age, p.breed, p.location, p.photo, p.price, p.isSold, p.owner);
    }
    function getProductDetails(uint pId) public view returns (uint, string memory, string memory, string memory, string memory, uint, uint) {
        Product storage product = products[pId];
        return (product.pId, product.pName,product.pCategory,product.pBrand,product.picture,product.pPrice,product.stock);
        // return product;
    }

    // Retrieving one pet's price
    function getPrice(uint petId) public view returns (uint) {
        require(petId >= 0 && petId <= petCount);
        Pet storage p = pets[petId];
        return p.price;
    }
    function getProductPrice(uint pId) public view returns (uint) {
        require(pId >= 0 && pId <= productCount);
        Product storage product = products[pId];
        return product.pPrice;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function withdrawAll(address payable _to) external onlyOwner{
        require(address(this).balance > 0, "empty balance");
        _to.transfer(address(this).balance);
    }

    function setFilters(int conditionAge, int conditionPrice, int conditionStatus, int lowerAge, int higherAge, int lowerPrice, int higherPrice, int isSold) public payable returns (uint){
        filterCount++;
        filters[filterCount] = filter(conditionAge, conditionPrice, conditionStatus, lowerAge, higherAge, lowerPrice, higherPrice, isSold);
        return filterCount;
    }

    function getFilters() public view returns (int, int, int, int, int, int, int, int){
        filter storage f = filters[filterCount];
        return (f.conditionAge, f.conditionPrice, f.conditionStatus, f.lowerAge, f.higherAge, f.lowerPrice, f.higherPrice, f.isSold);
    }
}
