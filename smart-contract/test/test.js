const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LaunchToken & NewLaunchpad", function () {
  let LaunchToken;
  let NewLaunchpad;
  let launchpad;
  let owner;
  let addr1;
  let addr2;
  let addrs;
  let currentTime;

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    const NewLaunchpadFactory = await ethers.getContractFactory("NewLaunchpad");
    launchpad = await NewLaunchpadFactory.deploy();
    await launchpad.waitForDeployment();

    const block = await ethers.provider.getBlock('latest');
    currentTime = block.timestamp;
  });

  describe("Project Creation", function () {
    it("Should create a new project with correct parameters and active status", async function () {
      const startTime = currentTime + 100;
      const endTime = currentTime + 1000;

      await launchpad.createProject(
        "TST",                 
        1000000,              // increased initial supply
        "Test Token",         
        "Test Description",   
        ethers.parseEther("100"),  
        startTime,            
        endTime,             
        ethers.parseEther("0.1"),  // minimumpay
        1000,                      // ratioOfTokens
        ethers.parseEther("1")     // maxPay
      );

      const project = await launchpad.project(1);
      expect(project.isActive).to.equal(true);
      expect(project.ratioOfTokens).to.equal(1000);
      expect(project.minimumpay).to.equal(ethers.parseEther("0.1"));
      expect(project.maxPay).to.equal(ethers.parseEther("1"));
    });

    it("Should fail if goal is 0", async function () {
      const startTime = currentTime + 100;
      const endTime = currentTime + 1000;
      
      await expect(
        launchpad.createProject(
          "TST",
          1000000,
          "Test Token",
          "Test Description",
          0,  // goal = 0
          startTime,
          endTime,
          ethers.parseEther("0.1"), // minimumpay
          1000, // ratioOfTokens
          ethers.parseEther("1") // maxPay
        )
      ).to.be.revertedWith("Goal must be greater than 0");
    });
  });

  describe("Investment and Project Status", function () {
    beforeEach(async function () {
      // Create project with small goal to test completion
      const startTime = currentTime;
      const endTime = currentTime + 100000; // Increased time window
      
      await launchpad.createProject(
        "TST",
        1000000,
        "Test Token",
        "Test Description",
        ethers.parseEther("0.2"),  // Goal of 0.2 ETH
        startTime,
        endTime,
        ethers.parseEther("0.1"),  // minimumpay
        1000,                      // ratioOfTokens
        ethers.parseEther("0.15")  // maxPay
      );
    });

    it("Should deactivate project when goal is reached", async function () {
      // First investment
      await launchpad.connect(addr1).Invest(1, {
        value: ethers.parseEther("0.1")
      });
      
      let project = await launchpad.project(1);
      expect(project.isActive).to.equal(true);

      // Second investment reaches goal
      await launchpad.connect(addr2).Invest(1, {
        value: ethers.parseEther("0.1")
      });

      project = await launchpad.project(1);
      expect(project.isActive).to.equal(false);
    });

    it("Should not allow investment in completed project", async function () {
      // First two investments to complete the project
      await launchpad.connect(addr1).Invest(1, {
        value: ethers.parseEther("0.1")
      });
      
      await launchpad.connect(addr2).Invest(1, {
        value: ethers.parseEther("0.1")
      });

      // Try to invest in completed project
      await expect(
        launchpad.connect(addrs[0]).Invest(1, {
          value: ethers.parseEther("0.1")
        })
      ).to.be.revertedWith("Project funding is complete");
    });
  });

  describe("Investment", function () {
    beforeEach(async function () {
      const startTime = currentTime;
      const endTime = currentTime + 100000; // Increased time window
      
      await launchpad.createProject(
        "TST",
        1000000,
        "Test Token",
        "Test Description",
        ethers.parseEther("1"),
        startTime,
        endTime,
        ethers.parseEther("0.1"),  // minimumpay
        1000,                      // ratioOfTokens
        ethers.parseEther("0.2")   // maxPay
      );
    });

    it("Should allow investment with fixed amount", async function () {
      await expect(
        launchpad.connect(addr1).Invest(1, {
          value: ethers.parseEther("0.1")
        })
      ).to.emit(launchpad, "Invested")
        .withArgs(addr1.address, 1, 10000, 10000);

      const project = await launchpad.project(1);
      expect(project.totalInvestors).to.equal(1);
      expect(project.totalCollected).to.equal(ethers.parseEther("0.1"));
      expect(project.totalWithdrawable).to.equal(ethers.parseEther("0.1"));
    });

    it("Should fail if investment amount exceeds maxPay", async function () {
      await expect(
        launchpad.connect(addr1).Invest(1, {
          value: ethers.parseEther("0.3") // Greater than maxPay
        })
      ).to.be.revertedWith("Cannot invest huge amount");
    });

    it("Should fail if minimum payment is not met", async function () {
      await expect(
        launchpad.connect(addr1).Invest(1, {
          value: ethers.parseEther("0.05") // Less than minimumpay
        })
      ).to.be.revertedWith("Not enough funds");
    });
  });

  describe("Withdrawal", function () {
    beforeEach(async function () {
      const startTime = currentTime;
      const endTime = currentTime + 10000;
      
      await launchpad.createProject(
        "TST",
        1000000,
        "Test Token",
        "Test Description",
        ethers.parseEther("0.3"),  // Total goal
        startTime,
        endTime,
        ethers.parseEther("0.1"),  // minimumpay
        1000,                      // ratioOfTokens
        ethers.parseEther("0.2")   // maxPay - increased to allow 0.2 ETH investment
      );

      // Make initial investment
      await launchpad.connect(addr1).Invest(1, {
        value: ethers.parseEther("0.1")
      });
    });

    it("Should allow withdrawal after funding period ends", async function () {
      // Complete the project funding to deactivate it
      await launchpad.connect(addr2).Invest(1, {
        value: ethers.parseEther("0.2")
      });

      // Fast forward time past the funding period
      await ethers.provider.send("evm_increaseTime", [10001]);
      await ethers.provider.send("evm_mine");

      const initialBalance = await ethers.provider.getBalance(owner.address);
      
      // Project creator (owner) withdraws funds
      await expect(launchpad.withdrawFunding(1))  // Using owner by default
        .to.emit(launchpad, "Withdrawn")
        .withArgs(owner.address, 1);

      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should track multiple investments correctly", async function () {
      // Make second investment
      await launchpad.connect(addr2).Invest(1, {
        value: ethers.parseEther("0.1")
      });

      const project = await launchpad.project(1);
      expect(project.totalWithdrawable).to.equal(ethers.parseEther("0.2"));
      expect(project.totalCollected).to.equal(ethers.parseEther("0.2"));
      expect(project.totalInvestors).to.equal(2);
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      const startTime = currentTime;
      const endTime = currentTime + 10000;
      
      await launchpad.createProject(
        "TST",
        1000000,
        "Test Token",
        "Test Description",
        ethers.parseEther("0.2"),  // Reduced goal to 0.2 ETH
        startTime,
        endTime,
        ethers.parseEther("0.1"),  // minimumpay
        1000,                      // ratioOfTokens
        ethers.parseEther("0.2")   // maxPay
      );
    });

    it("Should return correct investment details", async function () {
      await launchpad.connect(addr1).Invest(1, {
        value: ethers.parseEther("0.1")
      });

      const investment = await launchpad.getInvestors(addr1.address);
      expect(investment.investor).to.equal(addr1.address);
      expect(investment.amount).to.equal(ethers.parseEther("0.1"));
      expect(investment.tokenSupply).to.equal(10000);
      expect(investment.projectId).to.equal(1);
    });

    it("Should correctly return project active status", async function () {
      // Check initial active status
      expect(await launchpad.isProjectActive(1)).to.equal(true);

      // Complete project funding with 0.2 ETH (matches goal)
      await launchpad.connect(addr1).Invest(1, {
        value: ethers.parseEther("0.2")
      });

      // Check final active status
      expect(await launchpad.isProjectActive(1)).to.equal(false);
    });
  });

  describe("LaunchToken", function () {
    it("Should mint tokens with correct initial supply", async function () {
      const LaunchTokenFactory = await ethers.getContractFactory("LaunchToken");
      const token = await LaunchTokenFactory.deploy(
        "Test Token",
        "TST",
        1000000,
        owner.address
      );
      await token.waitForDeployment();

      const totalSupply = await token.totalSupply();
      const ownerBalance = await token.balanceOf(owner.address);
      
      expect(totalSupply).to.equal(1000000);
      expect(ownerBalance).to.equal(1000000);
    });
  });
});
