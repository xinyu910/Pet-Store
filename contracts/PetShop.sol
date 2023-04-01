pragma solidity >=0.4.22 <0.9.0;

contract PetShop {
    struct Pet {
        uint256 id;
        string name;
        uint256 age;
        string breed;
        string location;
        string photo;
        uint256 price;
        bool isSold;
        address owner;
    }

    mapping(uint256 => Pet) public pets;

    uint256 public petCount;
    uint256 public fee;

    event PetRegistered(uint256 petId);

    constructor(uint256 _fee) {
        petCount = 0;
        fee = _fee;
    }

    function registerPet(string memory _name, uint256 _age, string memory _breed, 
    string memory _location, string memory _photo, uint256 _price) public payable{
        require(msg.value >= fee, "Insufficient fee");
        petCount++;
        pets[petCount] = Pet(petCount, _name, _age, _breed, _location, _photo, _price, false, address(0));
        emit PetRegistered(petCount);
    }

    function buyPet(uint256 _id) public payable {
        Pet storage pet = pets[_id];
        require(!pet.isSold, "This pet is already sold");
        require(msg.value >= pet.price, "Insufficient funds");
        pet.isSold = true;
        pet.owner = msg.sender;
    }
}
