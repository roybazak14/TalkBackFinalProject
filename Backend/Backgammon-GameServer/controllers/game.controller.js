import { socketEmit } from "../app.js";
import {
  existsInMap as existsInUsernameToSocketIdMap,
  getGameId,
} from "../utils/utils.js";

export const usernameToSocketIdMap = {};

export const openGames = {};

export async function userJoin(req, res, next) {
  try {
    const { username, opponent, socketId } = req.body;
    if (!username || !opponent || socketId === "")
      return res.status(404).send("Bad request");
    const gameId = getGameId(username, opponent);
    console.log("entering " + gameId + `Date is ${Date.now()}`);
    if (
      openGames[gameId] &&
      openGames[gameId].onlineUsers &&
      openGames[gameId].onlineUsers[username] &&
      openGames[gameId].onlineUsers[opponent]
    ) {
      return res.status(404).send("Game is currently on");
    }
    openGames[gameId] = {
      firstPlayer: "",
      onlineUsers: {
        [username]: true,
      },
    };
    usernameToSocketIdMap[username] = socketId;
    if (!usernameToSocketIdMap[opponent]) return res.status(200);

    socketEmit("user-connection", "", usernameToSocketIdMap[opponent]);
    res.status(200).send({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}

export async function endGame(req, res, next) {
  try {
    console.log("end game");
    const { username, opponent } = req.body;
    if (!username || !opponent) return res.status(404).send("Bad request");
    const gameId = getGameId(username, opponent);
    console.log("exiting " + gameId);
    delete openGames[gameId];
    next();
  } catch (err) {
    return res.status(500).send("Internal server error");
  }
}

function areUsersConnected(username, opponent) {
  return (
    username &&
    opponent &&
    usernameToSocketIdMap[username] &&
    usernameToSocketIdMap[opponent]
  );
}

export async function startGame(req, res, next) {
  try {
    const { gameObject, username, opponent } = req.body;
    if (!gameObject) {
      return res.status(404).send("one or more fields is invalid");
    }
    if (!areUsersConnected(username, opponent)) {
      return res.status(404).send("username or opponent not connected");
    }
    socketEmit(
      "opponent-started-game",
      gameObject,
      usernameToSocketIdMap[opponent]
    );
    return res.status(200).json("Some data if needed");
  } catch (err) {
    return res.status(500).send("internal server error");
  }
}

export async function select(req, res, next) {
  try {
    const { username, opponent, json } = req.body;

    if (!json || !username || !opponent) {
      return res.status(400).send("Missing required fields");
    }

    if (typeof json !== "string" || json === null) {
      return res.status(400).send("Invalid JSON format");
    }

    if (!areUsersConnected(username, opponent)) {
      return res.status(404).send("Username or opponent not connected");
    }

    socketEmit("opponent-select", json, usernameToSocketIdMap[opponent]);
    console.log("the response is ", res);
    return res.status(200).json("Some data if needed");
  } catch (err) {
    if (err instanceof SyntaxError) {
      return res.status(400).send("Invalid JSON format");
    } else if (err instanceof TypeError) {
      return res.status(400).send("Invalid request body");
    } else {
      return res.status(500).send("Internal server error");
    }
  }
}

export async function notifyChangeTurn(req, res, next) {
  try {
    const { message, username, opponent } = req.body;
    if (!message) return res.status(404).send("one or more fields is invalid");
    if (!areUsersConnected(username, opponent))
      return res.status(404).send("username or opponent not connected");
    socketEmit("changed-turn", message, usernameToSocketIdMap[opponent]);
    return res.status(200).json("Some data if needed");
  } catch (err) {
    return res.status(500).send("Internal server error");
  }
}

export async function rollDice(req, res, next) {
  try {
    const { turnJson, username, opponent } = req.body;
    if (!turnJson) {
      return res.status(404).send("one or more fields is invalid");
    }
    if (!areUsersConnected(username, opponent)) {
      return res.status(404).send("username or opponent not connected");
    }
    console.log("emmiting");
    socketEmit(
      "opponent-rolled-dice",
      turnJson,
      usernameToSocketIdMap[opponent]
    );
    console.log("passed socket");
    return res.status(200).json("Some data if needed");
  } catch (err) {
    return res.status(500).send("Internal server error");
  }
}

export async function getFirstPlayer(req, res, next) {
  try {
    const players = req.body.users;
    console.log(players);
    const gameId = getGameId(players[0], players[1]);
    if (openGames[gameId].firstPlayer !== "") {
      return res.status(200).json({ result: openGames[gameId].firstPlayer });
    }
    if (players.length !== 2) return res.status(404).send("No players");
    if (
      !existsInUsernameToSocketIdMap(players[0], usernameToSocketIdMap) ||
      !existsInUsernameToSocketIdMap(players[1], usernameToSocketIdMap)
    ) {
      return res.status(404).send("One or more users is offline");
    }
    const chance = Math.floor(Math.random() * 100);
    const result = chance > 50 ? players[0] : players[1];
    console.log(result);
    setFirstPlayer(gameId, result);
    return res.status(200).json({ startingPlayer: result });
  } catch (err) {
    return res.status(500).send("Internal server error");
  }
}

export function setFirstPlayer(gameId, playername) {
  openGames[gameId].firstPlayer = playername;
}
