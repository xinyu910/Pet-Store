pragma solidity >=0.4.22 <0.9.0;

contract PetShop {
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
    }

    function registerPet(string memory _name, uint _age, string memory _breed, 
    string memory _location, string memory _photo, uint _price, uint _fee) public payable returns (uint) {
        require(msg.value >= _fee, "Insufficient fee");
        petCount++;
        pets[petCount] = Pet(petCount, _name, _age, _breed, _location, _photo, _price, false, address(0));
        return petCount;
    }

    function buyPet(uint _id) public payable {
        require(_id >= 0 && _id<= petCount);
        Pet storage pet = pets[_id];
        require(!pet.isSold, "This pet is already sold");
        require(msg.value >= pet.price, "Insufficient funds");
        pet.isSold = true;
        pet.owner = msg.sender;
    }

    function adopt(uint _id) public returns (uint) {
        require(_id >= 0 && _id <= petCount);
        Pet storage pet = pets[_id];
        require(!pet.isSold, "This pet is already adpoted");
        pet.isSold = true;
        pet.owner = msg.sender;
        return _id;
    }

    function getCount() view public returns (uint) {
        return petCount;
    }
}
