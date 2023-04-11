pragma solidity >=0.4.22 <0.9.0;

contract PetShop {
    address public owner;
    address private _admin;

    //struct of a pet's info, picture = ipfs url
    struct Pet {
        uint id;
        string name;
        uint age;
        string sex;
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

    mapping(uint => Pet) public pets;
    mapping(uint => Product) public products;

    uint public petCount;
    uint public productCount;

    constructor() public {
        petCount = 0;
        productCount = 0;
        owner = msg.sender;
        _admin = msg.sender;
        addProduct("Brown Rice Recipe Dog Food","Food&Treats","Performatrin","images/product1.jpg",1*10000,1000);
        addProduct("Homestead Harvest Cat Food","Food&Treats","ACANA","images/product2.jpg",2*10000,200);
        addProduct("Grey & White Hooded Litter Box","Litter&Accessories","Savic","images/product3.jpg",2*10000,20);
        addProduct("Giant Litter Scoop","Litter&Accessories","Van Ness","images/product4.jpg",2*10000,66);
        addProduct("NatureMates Bird Teaser","Supplies","Jump","images/product5.jpg",5*1000,88);
        addProduct("Felix Hammock Cat Condo","Supplies","Jump","images/product6.jpg",2*10000,500);
        addProduct("Wellness exams","Service","Pet Good Life","images/product7.jpg",2*100000,8888);
        addProduct("Vaccinations","Service","Pet Good Life","images/product8.jpg",2*10000,3);
        addProduct("Teeth cleaning and dentistry","Service","Pet Good Life","images/product9.jpg",6*10000,17);
    }

    function addProduct(string memory pName, string memory pCategory, string memory pBrand, string memory picture, uint pPrice, uint stock) public payable onlyAdmin returns (uint){
        require (pPrice > 0,"unsatisfied price");
        require (stock >= 0,"unsatisfied stock");
        products[productCount] = Product(productCount, pName, pCategory, pBrand, picture, pPrice, stock);
        return productCount++;
    }
    
    function registerPet(string memory _name, uint _age, string memory _sex, string memory _breed, 
    string memory _location, string memory _photo, uint _price, uint _fee) public payable returns (uint) {
        require(msg.value >= _fee, "Insufficient fee");
        petCount++;
        pets[petCount] = Pet(petCount, _name, _age, _sex, _breed, _location, _photo, _price, false, address(0));
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
        string memory, uint, bool, address, string memory) {
        require(petId >= 0 && petId <= petCount);
        Pet storage p = pets[petId];
        return (p.id, p.name, p.age, p.breed, p.location, p.photo, p.price, p.isSold, p.owner, p.sex);
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
    modifier onlyAdmin() {
        require(msg.sender == _admin,"You are not admin");
        _;
    }
    // function isAdmin() public view returns (bool){
    //     return _admin == msg.sender;
    // }
    // function getSender() public view returns (address){
    //     return msg.sender;
    // }
    function getAdmin() public view returns (address){
        return _admin;
    }

    function withdrawAll(address payable _to) external onlyOwner{
        require(address(this).balance > 0, "empty balance");
        _to.transfer(address(this).balance);
    }

    
}
