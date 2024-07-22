async function main() {
  const Voting = await ethers.getContractFactory("Voting");

  const durationInSeconds = 3 * 7 * 24 * 60 * 60;

  // Start deployment, returning a promise that resolves to a contract object
  const voting = await Voting.deploy(["Euno", "Margret", "Henry", "Shaun"], durationInSeconds);
  console.log("Contract address:", voting.address);
}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});
