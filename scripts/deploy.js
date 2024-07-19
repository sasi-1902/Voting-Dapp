async function main() {
  const Voting = await ethers.getContractFactory("Voting");

  // Start deployment, returning a promise that resolves to a contract object
  const voting = await Voting.deploy(["Euno", "Margret", "Henry", "Shaun"], 5760); // 4 days in minutes
  console.log("Contract address:", voting.address);
}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});
