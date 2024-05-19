const express = require("express");
const router = express.Router();
const conn = require("../mariadb");
const { body, param, validationResult } = require("express-validator");

router.use(express.json());

const validate = (req, res, next) => {
  const err = validationResult(req);

  if (err.isEmpty()) {
    return next(); // 다음 할 일 (미들 웨어, 함수)
  } else {
    return res.status(400).json(err.array());
  }
};

router
  .route("/")
  .post(
    [
      body("ownerId").notEmpty().isInt().withMessage("숫자 입력 필요"),
      body("channelName").notEmpty().isString().withMessage("문자 입력 필요"),
      validate,
    ],
    (req, res) => {
      const { channelName, ownerId } = req.body;

      let sql = `INSERT INTO utubeChannels (channelName, ownerId) VALUES (?, ?)`;
      conn.query(sql, [channelName, ownerId], function (err, results) {
        if (err) return res.status(400).end();

        res.status(201).json(results);
      });
    }
  )
  .get(
    [
      body("ownerId").notEmpty().isInt().withMessage("숫자 입력 필요"),
      validate,
    ],
    (req, res) => {
      var { ownerId } = req.body;

      let sql = `SELECT * from utubeChannels WHERE ownerId=?`;

      conn.query(sql, ownerId, function (err, results) {
        if (err) {
          return res.status(400).end();
        }

        if (results.length) {
          res.status(200).json(results);
        } else {
          return res.status(400).end();
        }
      });
    }
  );

router
  .route("/:id")
  .put(
    [
      param("id").notEmpty().withMessage("채널 id 필요"),
      body("channelName").notEmpty().isString().withMessage("채널명 오류"),
      validate,
    ],
    (req, res) => {
      let { id } = req.params;
      let { channelName } = req.body;
      id = parseInt(id);

      let sql = `UPDATE utubeChannels SET channelName=? WHERE id= ?`;
      let values = [channelName, id];
      conn.query(sql, values, function (err, results) {
        if (err) {
          console.log(err);
          return res.status(400).end();
        }

        if (results.affectedRows == 0) {
          return res.status(400).end();
        } else {
          res.status(201).json(results);
        }
      });
    }
  )
  .delete(
    [param("id").notEmpty().withMessage("채널 id 필요"), validate],
    (req, res) => {
      let { id } = req.params;
      id = parseInt(id);

      let sql = `DELETE from utubeChannels WHERE id=?`;
      conn.query(sql, id, function (err, results) {
        if (err) {
          return res.status(400).end();
        }

        if (results.affectedRows == 0) {
          return res.status(400).end();
        } else {
          res.status(200).json({
            message: `채널이 정상적으로 삭제되었습니다.`,
          });
        }
      });
    }
  )
  .get(
    [param("id").notEmpty().withMessage("채널 id 필요"), validate],
    (req, res) => {
      let { id } = req.params;
      id = parseInt(id);

      let sql = `SELECT * from utubeChannels WHERE id =  ?`;
      conn.query(sql, id, function (err, results) {
        if (err) {
          return res.status(400).end();
        }

        if (results.length) {
          res.status(200).json(results);
        } else {
          return res.status(400).end();
        }
      });
    }
  );

module.exports = router;
