const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Cross-Chain Token Bridge", function () {
  let token;
  let ethPortal;
  let polyPortal;

  const AMOUNT = ethers.utils.parseEther("100");

  beforeEach(async function () {
    const Token = await ethers.getContractFactory("DummyEthToken");
    token = await Token.deploy();
    await token.deployed();

    const EthPortal = await ethers.getContractFactory("EthereumPortal");
    ethPortal = await EthPortal.deploy(token.address);
    await ethPortal.deployed();

    const PolyPortal = await ethers.getContractFactory("PolygonPortal");
    polyPortal = await PolyPortal.deploy(token.address);
    await polyPortal.deployed();
  });

  it("should transfer tokens from Ethereum to Polygon", async function () {
    const [sender, receiver] = await ethers.getSigners();

    // Mint tokens to sender
    await token.connect(sender).mint(sender.address, AMOUNT);

    // Approve the Ethereum portal to spend tokens on behalf of sender
    await token.connect(sender).approve(ethPortal.address, AMOUNT);

    // Burn tokens on Ethereum and initiate cross-chain transfer
    const nonce = 0;
    await expect(
      ethPortal.connect(sender).burn(receiver.address, AMOUNT, nonce)
    )
      .to.emit(ethPortal, "CrossTransfer")
      .withArgs(
        sender.address,
        receiver.address,
        AMOUNT,
        ethers.BigNumber,
        nonce,
        ethers.AnyBytes,
        0 // Burn
      );

    // Wait for the cross-chain transfer event on Polygon
    const polyFilter = polyPortal.filters.CrossTransfer(
      null,
      null,
      null,
      null,
      nonce,
      null,
      1 // Mint
    );
    const [polyEvent] = await polyPortal.queryFilter(polyFilter);
    expect(polyEvent.args.sender).to.equal(sender.address);
    expect(polyEvent.args.reciever).to.equal(receiver.address);
    expect(polyEvent.args.tokenAmount).to.equal(AMOUNT);
    expect(polyEvent.args.timestamp).to.be.a("number");
    expect(polyEvent.args.nonce).to.equal(nonce);
    expect(polyEvent.args.signature).to.be.instanceOf(Uint8Array);
    expect(polyEvent.args.status).to.equal(1); // Mint
  });

  it("should transfer tokens from Polygon to Ethereum", async function () {
    const [sender, receiver] = await ethers.getSigners();

    // Mint tokens to sender on Polygon
    await token.connect(sender).mint(sender.address, AMOUNT);
    await token.connect(sender).approve(polyPortal.address, AMOUNT);

    // Burn tokens on Polygon and initiate cross-chain transfer
    const nonce = 0;
    await expect(
      polyPortal.connect(sender).burn(receiver.address, AMOUNT, nonce)
    )
      .to.emit(polyPortal, "CrossTransfer")
      .withArgs(
        sender.address,
        receiver.address,
        AMOUNT,
        ethers.BigNumber,
        nonce,
        ethers.AnyBytes,
        0 // Burn
      );

    // Wait for the cross-chain transfer event on Ethereum
    const ethFilter = ethPortal.filters.CrossTransfer(
      null,
      null,
      null,
      null,
      nonce,
      null,
      1 // Mint
    );
    const [ethEvent] = await ethPortal.queryFilter(ethFilter);
    expect(ethEvent.args.sender).to.equal(sender.address);
    expect(ethEvent.args.reciever).to.equal(receiver.address);
    expect(ethEvent.args.tokenAmount).to.equal(AMOUNT);
    expect(ethEvent.args.timestamp).to.be.a("number");
    expect(ethEvent.args.nonce).to.equal(nonce);
    expect(ethEvent.args.signature).to.be.instanceOf(Uint8Array);
    expect(ethEvent.args.status).to.equal(1); // Mint
  });

  it("should not allow burning tokens with an invalid nonce", async function () {
    const [sender, receiver] = await ethers.getSigners();

    // Mint tokens to sender
    await token.connect(sender).mint(sender.address, AMOUNT);

    // Approve the Ethereum portal to spend tokens on behalf of sender
    await token.connect(sender).approve(ethPortal.address, AMOUNT);

    // Burn tokens on Ethereum with invalid nonce
    const invalidNonce = 999;
    await expect(
      ethPortal.connect(sender).burn(receiver.address, AMOUNT, invalidNonce)
    ).to.be.revertedWith("Already transferred");
  });

  it("should not allow minting tokens from a non-owner", async function () {
    const [sender, receiver] = await ethers.getSigners();

    // Mint tokens to sender on Polygon
    await token.connect(sender).mint(sender.address, AMOUNT);
    await token.connect(sender).approve(polyPortal.address, AMOUNT);

    // Try to mint tokens on Ethereum from a non-owner account
    const nonce = 0;
    const invalidSender = ethers.Wallet.createRandom();
    await expect(
      polyPortal
        .connect(invalidSender)
        .mint(sender.address, receiver.address, AMOUNT, nonce, [])
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should not allow burning tokens without approval", async function () {
    const [sender, receiver] = await ethers.getSigners();

    // Mint tokens to sender
    await token.connect(sender).mint(sender.address, AMOUNT);

    // Burn tokens on Ethereum without approval
    const nonce = 0;
    await expect(
      ethPortal.connect(sender).burn(receiver.address, AMOUNT, nonce)
    ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
  });
});
