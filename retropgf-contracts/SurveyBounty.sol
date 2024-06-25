// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract SurveyBounty is Ownable, ReentrancyGuard {
    enum SurveyStatus {
        Active,
        Completed
    }

    struct Survey {
        address creator;
        IERC20 token;
        uint256 bounty; // Amount of tokens in decimal notation
        uint256 remainingBounty;
        uint256 startTime;
        string topic;
        string question;
        string[] options;
        SurveyStatus status;
        uint256 maxParticipants;
        uint256 feeBasisPoints;
        uint256 claimCount;
        mapping(address => bool) hasClaimed;
    }

    mapping(uint256 => Survey) public surveys;
    address public donationAddress;
    address public treasuryAddress;
    uint256 public minSurveyAmount; // Represented in tokens
    uint256 public surveyCount;
    uint256 private constant WEIGHTED_TOTAL_BASIS_POINTS = 1000;
    uint256 private constant FEE_TOTAL_BASIS_POINTS = 10000;

    event SurveyStarted(uint256 indexed surveyId, address indexed creator);
    event SurveyCompleted(uint256 indexed surveyId);
    event RewardClaimed(
        uint256 indexed surveyId,
        address indexed claimant,
        uint256 amount,
        bool donated
    );
    event RefundIssued(uint256 indexed surveyId, uint256 amount);
    event DonationAddressUpdated(address indexed newDonationAddress);
    event TreasuryAddressUpdated(address indexed newTreasuryAddress);
    event MinSurveyAmountUpdated(uint256 newMinSurveyAmount);

    constructor(
        address initialOwner,
        address _donationAddress,
        address _treasuryAddress,
        uint256 _minSurveyAmount
    ) Ownable(initialOwner) {
        require(
            _donationAddress != address(0),
            "Donation address cannot be zero"
        );
        require(
            _treasuryAddress != address(0),
            "Treasury address cannot be zero"
        );
        donationAddress = _donationAddress;
        treasuryAddress = _treasuryAddress;
        minSurveyAmount = _minSurveyAmount;
    }

    /**
     * @dev Let users create their own survey
     * @param tokenAddress The contract address of the ERC-20 token.
     * @param bounty The total amount of tokens in the bounty.
     * @param topic The subject matter or theme of the survey.
     * @param question The specific question or inquiry the survey is meant to address.
     * @param options The choices of the survey (max 4).
     * @param maxParticipants The max number of participants that get rewarded.
     * @param feeBasisPoints The survey fee that goes to the protocol.
     */
    function startSurvey(
        address tokenAddress,
        uint256 bounty,
        string memory topic,
        string memory question,
        string[] memory options,
        uint256 maxParticipants,
        uint256 feeBasisPoints
    ) external nonReentrant {
        require(maxParticipants > 0, "Max participants must be greater than 0");
        require(
            feeBasisPoints <= FEE_TOTAL_BASIS_POINTS,
            "Fee basis points exceed maximum allowed"
        );
        require(
            options.length > 1 && options.length <= 4,
            "Invalid number of options"
        );
        require(
            bounty > minSurveyAmount,
            "Bounty must be greater than min survey amount"
        );

        IERC20Metadata token = IERC20Metadata(tokenAddress);

        uint8 tokenDecimals = token.decimals();
        uint256 bountyInSmallestUnits = bounty * (10**uint256(tokenDecimals));

        require(
            token.allowance(msg.sender, address(this)) >= bountyInSmallestUnits,
            "Bounty exceeds allowance"
        );

        uint256 feeAmount = (bountyInSmallestUnits * feeBasisPoints) /
            FEE_TOTAL_BASIS_POINTS;
        uint256 bountyAfterFee = bountyInSmallestUnits - feeAmount;

        require(
            token.transferFrom(msg.sender, address(this), bountyAfterFee),
            "Bounty transfer failed"
        );

        require(
            token.transfer(treasuryAddress, feeAmount),
            "Fee transfer failed"
        );

        uint256 surveyId = surveyCount++;
        Survey storage survey = surveys[surveyId];
        survey.creator = msg.sender;
        survey.token = IERC20(tokenAddress);
        survey.bounty = bountyAfterFee;
        survey.remainingBounty = bountyAfterFee;
        survey.topic = topic;
        survey.question = question;
        survey.options = options;
        survey.status = SurveyStatus.Active;
        survey.maxParticipants = maxParticipants;
        survey.feeBasisPoints = feeBasisPoints;
        survey.startTime = block.timestamp;

        emit SurveyStarted(surveyId, msg.sender);
    }

    /**
     * @dev Create a survey on behalf of users
     * @param tokenAddress The contract address of the ERC-20 token.
     * @param bounty The total amount of tokens in the bounty.
     * @param topic The subject matter or theme of the survey.
     * @param question The specific question or inquiry the survey is meant to address.
     * @param options The choices of the survey (max 4).
     * @param maxParticipants The max number of participants that get rewarded.
     * @param feeBasisPoints The survey fee that goes to the protocol.
     * @param userAddress Address of user who created survey.
     */
    function startSurvey(
        address tokenAddress,
        uint256 bounty,
        string memory topic,
        string memory question,
        string[] memory options,
        uint256 maxParticipants,
        uint256 feeBasisPoints,
        address userAddress
    ) external onlyOwner nonReentrant {
        require(maxParticipants > 0, "Max participants must be greater than 0");
        require(
            feeBasisPoints <= FEE_TOTAL_BASIS_POINTS,
            "Fee basis points exceed maximum allowed"
        );
        require(
            options.length > 1 && options.length <= 4,
            "Invalid number of options"
        );
        require(
            bounty > minSurveyAmount,
            "Bounty must be greater than min survey amount"
        );
        require(
            userAddress != address(0),
            "User address cannot be the zero address"
        );

        IERC20Metadata token = IERC20Metadata(tokenAddress);

        uint8 tokenDecimals = token.decimals();
        uint256 bountyInSmallestUnits = bounty * (10**uint256(tokenDecimals));

        require(
            token.allowance(userAddress, address(this)) >=
                bountyInSmallestUnits,
            "Bounty exceeds allowance"
        );

        uint256 feeAmount = (bountyInSmallestUnits * feeBasisPoints) /
            FEE_TOTAL_BASIS_POINTS;
        uint256 bountyAfterFee = bountyInSmallestUnits - feeAmount;

        require(
            token.transferFrom(userAddress, address(this), bountyAfterFee),
            "Bounty transfer failed"
        );

        require(
            token.transfer(treasuryAddress, feeAmount),
            "Fee transfer failed"
        );

        uint256 surveyId = surveyCount++;
        Survey storage survey = surveys[surveyId];
        survey.creator = userAddress;
        survey.token = IERC20(tokenAddress);
        survey.bounty = bountyAfterFee;
        survey.remainingBounty = bountyAfterFee;
        survey.topic = topic;
        survey.question = question;
        survey.options = options;
        survey.status = SurveyStatus.Active;
        survey.maxParticipants = maxParticipants;
        survey.feeBasisPoints = feeBasisPoints;
        survey.startTime = block.timestamp;

        emit SurveyStarted(surveyId, userAddress);
    }

    /**
     * @param surveyId The unique identifier of the survey whose bounty is to be claimed.
     * @param recipient The address of the recipient receiving the bounty.
     * @param donate Indicates whether the bounty should be sent to the donation address.
     * @param weight The weight of the bounty to be claimed, affecting the final amount.
     */
    function claimBounty(
        uint256 surveyId,
        address recipient,
        bool donate,
        uint256 weight
    ) external onlyOwner nonReentrant {
        require(surveyId < surveyCount, "Invalid survey ID");
        Survey storage survey = surveys[surveyId];
        require(survey.status == SurveyStatus.Active, "Survey not active");
        require(!survey.hasClaimed[recipient], "Reward already claimed");
        require(
            survey.claimCount < survey.maxParticipants,
            "Max participants reached"
        );
        require(
            weight >= 0 && weight <= WEIGHTED_TOTAL_BASIS_POINTS,
            "Invalid weight"
        );

        // The bounty is already in the smallest units, so we directly calculate the weighted amount
        uint256 claimableAmount = survey.bounty / survey.maxParticipants;
        uint256 weightedAmount = (claimableAmount * weight) /
            WEIGHTED_TOTAL_BASIS_POINTS;

        // Proceed with the transfer
        if (donate) {
            require(
                survey.token.transfer(donationAddress, weightedAmount),
                "Donation transfer failed"
            );
        } else {
            require(
                survey.token.transfer(recipient, weightedAmount),
                "Reward transfer failed"
            );
        }

        // Update survey state
        survey.hasClaimed[recipient] = true;
        survey.claimCount++;
        survey.remainingBounty -= weightedAmount;

        emit RewardClaimed(surveyId, recipient, weightedAmount, donate);
    }

    /**
     * @param surveyId The unique identifier of the survey to be completed.
     */
    function completeSurvey(uint256 surveyId) external onlyOwner {
        require(surveyId < surveyCount, "Invalid survey ID");
        Survey storage survey = surveys[surveyId];
        require(survey.status == SurveyStatus.Active, "Survey not active");

        uint256 unclaimedTokens = survey.remainingBounty;
        if (unclaimedTokens > 0) {
            require(
                survey.token.transfer(survey.creator, unclaimedTokens),
                "Refund transfer failed"
            );
            survey.remainingBounty = 0;
        }

        survey.status = SurveyStatus.Completed;

        emit SurveyCompleted(surveyId);
    }

    /**
     * @param _donationAddress The new donation address.
     */
    function updateDonationAddress(address _donationAddress)
        external
        onlyOwner
    {
        require(
            _donationAddress != address(0),
            "Donation address cannot be zero."
        );
        donationAddress = _donationAddress;
        emit DonationAddressUpdated(_donationAddress);
    }

    /**
     * @param _treasuryAddress The new treasury address.
     */
    function updateTreasuryAddress(address _treasuryAddress)
        external
        onlyOwner
    {
        require(
            _treasuryAddress != address(0),
            "Treasury address cannot be zero."
        );
        treasuryAddress = _treasuryAddress;
        emit TreasuryAddressUpdated(_treasuryAddress);
    }

    /**
     * @param _minSurveyAmount The new minimum amount (in tokens) required to submit a survey.
     */
    function updateMinSurveyAmount(uint256 _minSurveyAmount)
        external
        onlyOwner
    {
        minSurveyAmount = _minSurveyAmount;
        emit MinSurveyAmountUpdated(_minSurveyAmount);
    }

    /**
     * @param _tokenContract The token contract used across surveys.
     * @param _amount The amount of tokens.
     */
    function withdrawTokens(address _tokenContract, uint256 _amount)
        external
        onlyOwner
    {
        IERC20 tokenContract = IERC20(_tokenContract);
        require(
            tokenContract.balanceOf(address(this)) >= _amount,
            "Insufficient balance."
        );
        require(
            tokenContract.transfer(msg.sender, _amount),
            "Transfer failed."
        );
    }

    function renounceOwnership() public view override onlyOwner {
        revert("Renouncing ownership is disabled");
    }

    receive() external payable {
        revert("Direct ETH transfers not allowed");
    }
}