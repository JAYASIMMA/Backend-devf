"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var database_1 = __importDefault(require("./config/database"));
var user_1 = __importDefault(require("./models/user"));
var SchoolAdmin_1 = __importDefault(require("./models/SchoolAdmin"));
var School_1 = __importDefault(require("./models/School"));
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var createAdmin = function () { return __awaiter(void 0, void 0, void 0, function () {
    var school, fullName, mobileNumber, email, password, cleanName, phoneSuffix, username, oldUser, oldUserByEmail, hashedPassword, user, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 14, , 15]);
                return [4 /*yield*/, database_1.default.authenticate()];
            case 1:
                _a.sent();
                console.log('Database connected.');
                return [4 /*yield*/, School_1.default.findOne()];
            case 2:
                school = _a.sent();
                if (!!school) return [3 /*break*/, 4];
                console.log('No school found. Creating dummy school...');
                return [4 /*yield*/, School_1.default.create({
                        name: 'Special Nest Academy',
                        address: '123 Test St',
                        city: 'Test City',
                        state: 'Test State',
                        zipCode: '12345',
                        contactNumber: '9999999999',
                        email: 'school@test.com'
                    })];
            case 3:
                school = _a.sent();
                _a.label = 4;
            case 4:
                fullName = 'TestAdmin';
                mobileNumber = '9876543210';
                email = 'schooladmin@test.com';
                password = 'password123';
                cleanName = fullName.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
                phoneSuffix = mobileNumber.slice(-4);
                username = "".concat(cleanName).concat(phoneSuffix);
                console.log("Creating Admin: ".concat(username));
                return [4 /*yield*/, user_1.default.findOne({ where: { mobileNumber: mobileNumber } })];
            case 5:
                oldUser = _a.sent();
                if (!oldUser) return [3 /*break*/, 7];
                console.log('User already exists. Deleting...');
                return [4 /*yield*/, user_1.default.destroy({ where: { id: oldUser.id } })];
            case 6:
                _a.sent();
                _a.label = 7;
            case 7: return [4 /*yield*/, user_1.default.findOne({ where: { email: email } })];
            case 8:
                oldUserByEmail = _a.sent();
                if (!oldUserByEmail) return [3 /*break*/, 10];
                console.log('User email already exists. Deleting...');
                return [4 /*yield*/, user_1.default.destroy({ where: { id: oldUserByEmail.id } })];
            case 9:
                _a.sent();
                _a.label = 10;
            case 10: return [4 /*yield*/, bcryptjs_1.default.hash(password, 10)];
            case 11:
                hashedPassword = _a.sent();
                return [4 /*yield*/, user_1.default.create({
                        email: email,
                        mobileNumber: mobileNumber,
                        password: hashedPassword,
                        role: 'school_admin',
                        schoolId: school.id,
                        isFirstLogin: false, // Skip reset for this test user
                        username: username
                    })];
            case 12:
                user = _a.sent();
                return [4 /*yield*/, SchoolAdmin_1.default.create({
                        userId: user.id,
                        schoolId: school.id,
                        fullName: fullName,
                        email: email,
                        phoneNumber: mobileNumber,
                        designation: 'Principal',
                        isActive: true,
                        permissions: ['all']
                    })];
            case 13:
                _a.sent();
                console.log("\u2705 School Admin Created!");
                console.log("Username: ".concat(username));
                console.log("Mobile: ".concat(mobileNumber));
                console.log("Password: ".concat(password));
                process.exit(0);
                return [3 /*break*/, 15];
            case 14:
                error_1 = _a.sent();
                console.error('Error:', error_1);
                process.exit(1);
                return [3 /*break*/, 15];
            case 15: return [2 /*return*/];
        }
    });
}); };
createAdmin();
