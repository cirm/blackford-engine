const bcrypt = require('bcrypt');

/**
 * Generates random salt that's generated in N rounds
 * @param {number} times Times to generate the salt
 * @returns  {Promise<string>}
 */
const createSalt = async (times = 11) => bcrypt.genSalt(times);

/**
 * Hash the password with given salt
 * @param {string} pwd Password to hash
 * @param {string} salt Salt to hash the password with
 * @returns  {Promise<string>}
 */
const hashPwd = async (pwd, salt) => bcrypt.hash(pwd, salt);

/**
 * Compare password with the hashed password
 * @param {string} password Password to compare
 * @param {string} hashedPassword Hash to compare against
 * @returns {Promise<bool>}
 */
const compareHash = async (password, hashedPassword) =>
  bcrypt.compare(password, hashedPassword);

module.exports = {
  createSalt,
  compareHash,
  hashPwd,
};
