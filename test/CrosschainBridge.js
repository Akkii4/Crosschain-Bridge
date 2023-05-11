const { expect } = require("chai");

describe("CrosschainBridge", function () {
  let owner;
  let user1;
  let user2;
  let ethToken;
  let polyToken;
  let ethPortal;
  let polyPortal;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy MockToken contracts
    const MockToken = await ethers.getContractFactory("MockToken");
    ethToken = await MockToken.deploy("Dummy Ethereum Token", "DET");
    await ethToken.deployed();
    polyToken = await MockToken.deploy("Dummy Polygon Token", "DPT");
    await polyToken.deployed();

    // Deploy CrosschainBridge contracts
    const CrosschainBridge = await ethers.getContractFactory(
      "CrosschainBridge"
    );
    ethPortal = await CrosschainBridge.deploy(polyToken.address);
    await ethPortal.deployed();
    polyPortal = await CrosschainBridge.deploy(ethToken.address);
    await polyPortal.deployed();

    // Give some tokens to user1
    await ethToken
      .connect(owner)
      .mint(user1.address, ethers.utils.parseEther("1000"));
    await polyToken
      .connect(owner)
      .mint(user1.address, ethers.utils.parseEther("1000"));
  });

  it("should allow user to transfer tokens from Ethereum to Polygon", async function () {
    const amount = ethers.utils.parseEther("100");
    const nonce = 1;

    // Burn tokens on Ethereum
    await expect(ethToken.connect(user1).approve(ethPortal.address, amount))
      .to.emit(ethPortal, "Approval")
      .withArgs(user1.address, ethPortal.address, amount);
    await expect(ethPortal.connect(user1).burn(polyPortal.address, amount))
      .to.emit(ethPortal, "CrossTransfer")
      .withArgs(user1.address, polyPortal.address, amount, 0, nonce, 0);

    // Check that the tokens were burned on Ethereum
    expect(await ethToken.balanceOf(user1.address)).to.equal(
      ethers.utils.parseEther("900")
    );

    // Check that the tokens were minted on Polygon
    expect(await polyToken.balanceOf(user1.address)).to.equal(amount);
  });

  it("should allow user to transfer tokens from Polygon to Ethereum", async function () {
    const amount = ethers.utils.parseEther("100");
    const nonce = 1;

    // Burn tokens on Polygon
    await expect(polyToken.connect(user1).approve(polyPortal.address, amount))
      .to.emit(polyPortal, "Approval")
      .withArgs(user1.address, polyPortal.address, amount);
    await expect(polyPortal.connect(user1).burn(ethPortal.address, amount))
      .to.emit(polyPortal, "CrossTransfer")
      .withArgs(user1.address, ethPortal.address, amount, 0, nonce, 0);

    // Check that the tokens were burned on Polygon
    expect(await polyToken.balanceOf(user1.address)).to.equal(
      ethers.utils.parseEther("900")
    );

    // Check that the tokens were minted on Ethereum
    expect(await ethToken.balanceOf(user1.address)).to.equal(amount);
  });

  it("should prevent user from burning more tokens than they have on Ethereum", async function () {
    const amount = ethers.utils.parseEther("1001");

    // Attempt to burn more tokens than user has on Ethereum
    await expect(ethToken.connect(user1).approve(ethPortal.address, amount))
      .to.emit(ethPortal, "Approval")
      .withArgs(user1.address, ethPortal.address, amount);
    await expect(
      ethPortal.connect(user1).burn(polyPortal.address, amount)
    ).to.be.revertedWith("MockToken: burn amount exceeds balance");

    // Check that no tokens were burned on Ethereum
    expect(await ethToken.balanceOf(user1.address)).to.equal(
      ethers.utils.parseEther("1000")
    );

    // Check that no tokens were minted on Polygon
    expect(await polyToken.balanceOf(user1.address)).to.equal(0);
  });

  it("should prevent user from burning more tokens than they have on Polygon", async function () {
    const amount = ethers.utils.parseEther("1001");

    // Attempt to burn more tokens than user has on Polygon
    await expect(polyToken.connect(user1).approve(polyPortal.address, amount))
      .to.emit(polyPortal, "Approval")
      .withArgs(user1.address, polyPortal.address, amount);
    await expect(
      polyPortal.connect(user1).burn(ethPortal.address, amount)
    ).to.be.revertedWith("MockToken: burn amount exceeds balance");

    // Check that no tokens were burned on Polygon
    expect(await polyToken.balanceOf(user1.address)).to.equal(
      ethers.utils.parseEther("1000")
    );

    // Check that no tokens were minted on Ethereum
    expect(await ethToken.balanceOf(user1.address)).to.equal(0);
  });

  it("should prevent duplicate cross-chain transfers", async function () {
    const amount = ethers.utils.parseEther("100");
    const nonce = 1;

    // Burn tokens on Ethereum
    await expect(ethToken.connect(user1).approve(ethPortal.address, amount))
      .to.emit(ethPortal, "Approval")
      .withArgs(user1.address, ethPortal.address, amount);
    await expect(ethPortal.connect(user1).burn(polyPortal.address, amount))
      .to.emit(ethPortal, "CrossTransfer")
      .withArgs(user1.address, polyPortal.address, amount, 0, nonce, 0);

    // Attempt to burn the same tokens again with the same nonce
    await expect(ethToken.connect(user1).approve(ethPortal.address, amount))
      .to.emit(ethPortal, "Approval")
      .withArgs(user1.address, ethPortal.address, amount);
    await expect(
      ethPortal.connect(user1).burn(polyPortal.address, amount)
    ).to.be.revertedWith("Already transferred");

    // Check that the tokens were only burned once on Ethereum
    expect(await ethToken.balanceOf(user1.address)).to.equal(
      ethers.utils.parseEther("900")
    );

    // Check that the tokens were only minted once on Polygon
    expect(await polyToken.balanceOf(user1.address)).to.equal(amount);
  });
});
