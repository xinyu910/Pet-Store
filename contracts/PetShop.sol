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

    mapping(uint => Pet) public pets;

    uint public petCount;

    constructor() public {
        petCount = 0;
        owner = msg.sender;
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

    // Retrieving one pet's details
    function getPetDetails(uint petId) public view returns (uint, string memory, uint, string memory, string memory,
        string memory, uint, bool, address) {
        require(petId >= 0 && petId <= petCount);
        Pet storage p = pets[petId];
        return (p.id, p.name, p.age, p.breed, p.location, p.photo, p.price, p.isSold, p.owner);
    }

    // Retrieving one pet's price
    function getPrice(uint petId) public view returns (uint) {
        require(petId >= 0 && petId <= petCount);
        Pet storage p = pets[petId];
        return p.price;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function withdrawAll(address payable _to) external onlyOwner{
        require(address(this).balance > 0, "empty balance");
        _to.transfer(address(this).balance);
    }
}
