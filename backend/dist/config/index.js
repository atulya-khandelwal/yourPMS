"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_config_1 = __importDefault(require("./db-config"));
const email_config_1 = __importDefault(require("./email-config"));
const server_config_1 = __importDefault(require("./server-config"));
const configs = {
    serverConfig: server_config_1.default,
    emailConfig: email_config_1.default,
    dbConfig: db_config_1.default
};
exports.default = configs;
