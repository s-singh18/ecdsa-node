const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes } = require("ethereum-cryptography/utils");
const { secp256k1 } = require("ethereum-cryptography/secp256k1");

// Private keys
// 9d467bc62def8769c2859b7954db3baf9b71bb4ac515400609945ca363a2942d
// 10b1d61ba5692158dd2b1d8a0d438e2d1c8822a428bcf952b9c5d8af4b20fe81
// 18136fa570b85b1d00776e3a29ee2a13d4ed44da125dbf162f2a9d40eac609ff

const balances = {
  "028355979d0ccbca2b99bdb3bbbe4395449f63ae2802ad13434fff61979b62390e": 100,
  "02dee77388caf9a3f5194f50dab2c76102843ff9cfe54799d39b274335dc55d0fb": 50,
  "0214ab11d45901ebe427837e952abf034325f4ebe6d23885f9fcdcd4937cb00599": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  // TODO: get a signature from the client-side application
  // recover the public address from the signature
  // Send signed transaction through the server
  //
  const { sender, amount, recipient, signature, recoveryBit } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
  console.log(
    `Public key: ${secp256k1.utils.recoverPublicKey(
      hashMessage(toString(amount)),
      signature,
      recoveryBit
    )}`
  );
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

async function signMessage(msg, privateKey) {
  const messageHash = hashMessage(msg);
  return secp256k1.sign(messageHash, privateKey, { recovered: true });
}

function hashMessage(message) {
  return keccak256(utf8ToBytes(message));
}
