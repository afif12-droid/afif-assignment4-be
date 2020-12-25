const User = require("../models/User.model");
// const formidable = require("formidable");
// const fs = require("fs");
const Tournament = require("../models/Tournament.model");
const Role = require("../models/Role.model");
const District = require("../models/District.model");
const TournamentCategory = require("../models/TournamentCategory.model");
const TournamentApproved = require("../models/TournamentApproved.model");
const TournamentPrize = require("../models/TournamentPrize.model");
const Team = require("../models/Team.model");
const { result } = require("lodash");
const Game = require("../models/Game.model");

class panitiaController {
  static updatePanitia(req, res, next) {
    const { userId } = req.params;
    const { username, email, password, birthdate, phone } = req.body;
    const updatedData = { username, email, password, birthdate, phone };
    for (let key in updatedData) {
      if (!updatedData[key]) {
        delete updatedData[key];
      }
    }
    User.findByIdAndUpdate(userId, updatedData, { new: true })
      .then((panitia) => {
        res.status(200).json({
          message: "Berhasil mengupdate data panitia",
          updated: panitia,
        });
      })
      .catch(next);
  }

  static getPanitiaId(req, res, next) {
    const { userId } = req.params;
    User.findById(userId)
      .populate("Roles")
      .populate("districts")
      .then((result) => {
        res
          .status(200)
          .json({ message: "Berhasil mendapatkan data panitia", data: result });
      })
      .catch(next);
  }

  static dataPeserta(req, res, next) {
    User.find({ roles: "5fcb009dbb23a6115cc6b3f8" })
      .populate("roles")
      .then((result) => {
        res.status(200).json({
          message: "Berhasil mendapatkan list semua peserta",
          data: result,
        });
      })
      .catch(next);
  }

  static createTournament(req, res, next) {
    const url = req.protocol + "://" + req.get("host");
    Game.findOne({game_name: req.body.game},(err,result)=>{
      if(err){
        res.status(500).json({message:err})
      }
      const tournament = new Tournament({
        tournament_name: req.body.tournament_name,
        permalink: req.body.permalink,
        categories: req.body.categories,
        game: result, //renang 
        total_participant: req.body.total_participant,
        age_minimum: req.body.age_minimum,
        description: req.body.description,
        id_user_panitia: req.userId,
        image: url + "/images/" + req.file.originalname,
        tournament_is_started: "pending",
        districts: req.userDistrict,
      });
      
      tournament.save((err, tournament) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        User.findById(req.userId)
          .populate("districts")
          .then((user) => {
            res.status(201).json({ message: "Berhasil membuat turnament", user });
          })
          .catch(next);
      });
      
    })
    // const tournament = new Tournament({
    //   tournament_name: req.body.tournament_name,
    //   permalink: req.body.permalink,
    //   categories: req.body.categories,
    //   game: req.body.game, //renang 
    //   total_participant: req.body.total_participant,
    //   age_minimum: req.body.age_minimum,
    //   description: req.body.description,
    //   id_user_panitia: req.userId,
    //   image: url + "/images/" + req.file.filename,
    //   tournament_is_started: "pending",
    //   districts: req.userDistrict,
    // });

    // var districtss;
    // tournament.save((err, tournament) => {
    //   if (err) {
    //     res.status(500).send({ message: err });
    //     return;
    //   }
    //   User.findById(req.userId)
    //     .populate("districts")
    //     .then((user) => {
    //       console.log("datauser", user);
    //       res.status(201).json({ message: "Berhasil membuat turnament", user });
    //     })
    //     .catch(next);
    // });
  }

  static getGameCategory(req, res, next){
    let gameCategory;
    Tournament.findOne({id_user_panitia: req.userId})
    .then(user =>{
      console.log(user);
      gameCategory = user.game;
      Game.findOne({game_name: gameCategory})
      .then(game => {
        console.log(game)
        res.status(200).json({
          msg: "bisa"
        });
      })
      .catch(next);
    })
  }

  //buat filter on game
  // .find({game: "renang"})
  //

  //addcreategame

  static updateTournament(req, res, next) {
    const { tournamentId } = req.params;
    const {
      tournament_name,
      total_participant,
      age_minimum,
      description,
    } = req.body;
    const updatedData = {
      tournament_name,
      total_participant,
      age_minimum,
      description,
    };
    for (let key in updatedData) {
      if (!updatedData[key]) {
        delete updatedData[key];
      }
    }
    Tournament.findByIdAndUpdate(tournamentId, updatedData, { new: true })
      .then((tournament) => {
        res
          .status(200)
          .json({ message: "Berhasil mengupdate tournament", tournament });
      })
      .catch(next);
  }

  static viewRequestPeserta(req, res, next) {
    TournamentApproved.find()
      .then((approved) => {
        res.status(200).json({
          message: "berhasil mendapat list request peserta",
          approved,
        });
      })
      .catch(next);
  }

  static responseRequestPeserta(req, res, next) {
    const { approvedId } = req.params;
    const { status } = req.body;
    const updatedData = { status };
    TournamentApproved.findByIdAndUpdate(approvedId, updatedData, { new: true })
      .then((panitia) => {
        res.status(200).json({
          message: "Berhasil memberikan respon kepada peserta",
          updated: panitia,
        });
      })
      .catch(next);
  }

  static createPrizes(req, res, next) {
    const {
      tournament_name,
      first_prize,
      second_prize,
      third_prize,
    } = req.body;
    TournamentPrize.create({
      tournament_name,
      first_prize,
      second_prize,
      third_prize,
    })
      .then((result) => {
        res
          .status(201)
          .json({ message: "Berhasil membuat hadiah pada tournament", result });
      })
      .catch(next);
  }

  static createWinners(req, res, next) {
    const { tournamentId } = req.params;
    const { first_winner, second_winner, third_winner } = req.body;
    // const firstwinner = JSON.parse(req.body.first_winner);
    // const secondwinner = JSON.parse(req.body.second_winner);
    // const thirdwinner = JSON.parse(req.body.third_winner);

    if (first_winner && second_winner && third_winner) {
      Team.findOne({ team_name: { $in: first_winner } }).then((first) => {
        Tournament.findByIdAndUpdate(tournamentId, {
          first_winner: first.team_name,
        }).then((first) => {
          console.log(first);
        });
      });
      Team.findOne({ team_name: { $in: second_winner } }).then((second) => {
        Tournament.findByIdAndUpdate(tournamentId, {
          second_winner: second.team_name,
        }).then((second) => {
          console.log(second);
        });
      });
      Team.findOne({ team_name: { $in: third_winner } })
        .then((third) => {
          Tournament.findByIdAndUpdate(
            tournamentId,
            { third_winner: third.team_name },
            { upsert: true, returnOriginal: false }
          ).then((third) => {
            res.status(200).json({
              message: "Berhasil menambahkan pemenang perlombaan",
              third,
            });
          });
        })
        .catch(next);
    }
  }
}

module.exports = panitiaController;
