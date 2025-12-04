var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create(
        (typeof Iterator === "function" ? Iterator : Object).prototype,
      );
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
var __importDefault =
  (this && this.__importDefault) ||
  ((mod) => (mod && mod.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStateStatistics = updateStateStatistics;
var app_1 = require("firebase/app");
var firestore_1 = require("firebase/firestore");
var states_1 = require("../constants/states");

var BATCH_SIZE = 50;
var QUERY_LIMIT = 250;
var STATE_CHUNK_SIZE = 2;
var MAX_PAGES_PER_STATE = 800;
var GC_INTERVAL = 2;

var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: ".env.local" });
var firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

var requiredEnvVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
];
for (
  var _i = 0, requiredEnvVars_1 = requiredEnvVars;
  _i < requiredEnvVars_1.length;
  _i++
) {
  var envVar = requiredEnvVars_1[_i];
  if (!process.env[envVar]) {
    throw new Error("Missing required environment variable: ".concat(envVar));
  }
}

var app = (0, app_1.initializeApp)(firebaseConfig);
var db = (0, firestore_1.getFirestore)(app);

function withTimeout(promise_1) {
  return __awaiter(this, arguments, void 0, function (promise, timeoutMs) {
    var timeoutId, timeoutPromise, result, error_1;
    if (timeoutMs === void 0) {
      timeoutMs = 30000;
    }
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => {
              reject(
                new Error("Operation timed out after ".concat(timeoutMs, "ms")),
              );
            }, timeoutMs);
          });
          _a.label = 1;
        case 1:
          _a.trys.push([1, 3, , 4]);
          return [4 /*yield*/, Promise.race([promise, timeoutPromise])];
        case 2:
          result = _a.sent();
          clearTimeout(timeoutId);
          return [2 /*return*/, result];
        case 3:
          error_1 = _a.sent();
          clearTimeout(timeoutId);
          throw error_1;
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
function processStateChunk(states, statsCollection) {
  return __awaiter(this, void 0, void 0, function () {
    var batch,
      batchCount,
      retryCount,
      MAX_RETRIES,
      _loop_1,
      _i,
      states_2,
      state,
      error_2;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          batch = (0, firestore_1.writeBatch)(db);
          batchCount = 0;
          retryCount = 0;
          MAX_RETRIES = 3;
          _loop_1 = function (state) {
            var stateRef,
              officersRef,
              lastDoc,
              endDateStats,
              startDateStats,
              totalOfficers,
              hasMoreDocs,
              pageCount,
              lastDoc_1,
              q,
              snapshot,
              stateStats,
              statsDoc,
              error_3,
              stateStats,
              statsDoc,
              writeError_1;
            return __generator(this, (_b) => {
              switch (_b.label) {
                case 0:
                  stateRef = state.reference.toLowerCase();
                  officersRef = (0, firestore_1.collection)(db, "db_launch");
                  lastDoc = null;
                  endDateStats = {};
                  startDateStats = {};
                  totalOfficers = 0;
                  _b.label = 1;
                case 1:
                  _b.trys.push([1, 9, , 17]);
                  hasMoreDocs = true;
                  pageCount = 0;
                  lastDoc_1 = null;
                  _b.label = 2;
                case 2:
                  if (!(hasMoreDocs && pageCount < MAX_PAGES_PER_STATE))
                    return [3 /*break*/, 6];
                  pageCount++;
                  q = (0, firestore_1.query)(
                    officersRef,
                    (0, firestore_1.where)("state", "==", stateRef),
                    (0, firestore_1.orderBy)("__name__"),
                    (0, firestore_1.limit)(QUERY_LIMIT),
                  );
                  if (lastDoc_1) {
                    q = (0, firestore_1.query)(
                      q,
                      (0, firestore_1.startAfter)(lastDoc_1),
                    );
                  }
                  return [
                    4 /*yield*/,
                    withTimeout((0, firestore_1.getDocs)(q)),
                  ];
                case 3:
                  snapshot = _b.sent();
                  totalOfficers += snapshot.size;
                  if (snapshot.empty || snapshot.size < QUERY_LIMIT) {
                    hasMoreDocs = false;
                  } else {
                    lastDoc_1 = snapshot.docs[snapshot.docs.length - 1];
                  }

                  if (!(pageCount % GC_INTERVAL === 0 && global.gc))
                    return [3 /*break*/, 5];
                  global.gc();

                  return [
                    4 /*yield*/,
                    new Promise((resolve) => setTimeout(resolve, 100)),
                  ];
                case 4:
                  _b.sent();
                  _b.label = 5;
                case 5:
                  snapshot.forEach((doc) => {
                    var data = doc.data();

                    if (data.end_date) {
                      var endYear = new Date(data.end_date)
                        .getFullYear()
                        .toString();
                      endDateStats[endYear] = (endDateStats[endYear] || 0) + 1;
                    }

                    if (data.start_date) {
                      var startYear = new Date(data.start_date)
                        .getFullYear()
                        .toString();
                      startDateStats[startYear] =
                        (startDateStats[startYear] || 0) + 1;
                    }
                  });

                  if (global.gc) {
                    global.gc();
                  }
                  return [3 /*break*/, 2];
                case 6:
                  stateStats = {
                    title: state.name,
                    description:
                      "Police officer records and history in ".concat(
                        state.name,
                      ),
                    stats: [
                      {
                        label: "Total Officers",
                        value: totalOfficers.toString(),
                      },
                    ],
                    last_updated: new Date(),
                  };
                  statsDoc = (0, firestore_1.doc)(statsCollection, stateRef);
                  batch.set(statsDoc, stateStats);
                  batchCount++;

                  retryCount = 0;
                  if (
                    !(
                      batchCount === BATCH_SIZE ||
                      totalOfficers % (BATCH_SIZE * QUERY_LIMIT) === 0
                    )
                  )
                    return [3 /*break*/, 8];
                  return [4 /*yield*/, batch.commit()];
                case 7:
                  _b.sent();
                  batch = (0, firestore_1.writeBatch)(db);
                  batchCount = 0;
                  _b.label = 8;
                case 8:
                  return [3 /*break*/, 17];
                case 9:
                  error_3 = _b.sent();
                  console.error(
                    "Error processing state ".concat(state.name, ":"),
                    error_3,
                  );
                  if (!(retryCount < MAX_RETRIES)) return [3 /*break*/, 11];
                  retryCount++;
                  return [
                    4 /*yield*/,
                    new Promise((resolve) =>
                      setTimeout(resolve, 5000 * retryCount),
                    ),
                  ];
                case 10:
                  _b.sent();
                  return [2 /*return*/, "continue"];
                case 11:
                  if (!(totalOfficers > 0)) return [3 /*break*/, 16];
                  stateStats = {
                    title: state.name,
                    description:
                      "Partial police officer records and history in ".concat(
                        state.name,
                      ),
                    stats: [
                      {
                        label: "Total Officers",
                        value: totalOfficers.toString(),
                      },
                    ],
                    last_updated: new Date(),
                    is_partial: true,
                  };
                  _b.label = 12;
                case 12:
                  _b.trys.push([12, 15, , 16]);
                  statsDoc = (0, firestore_1.doc)(statsCollection, stateRef);
                  batch.set(statsDoc, stateStats);
                  batchCount++;
                  if (!(batchCount > 0)) return [3 /*break*/, 14];
                  return [4 /*yield*/, batch.commit()];
                case 13:
                  _b.sent();
                  batch = (0, firestore_1.writeBatch)(db);
                  batchCount = 0;
                  _b.label = 14;
                case 14:
                  return [3 /*break*/, 16];
                case 15:
                  writeError_1 = _b.sent();
                  console.error(
                    "Error storing partial results for ".concat(
                      state.name,
                      ":",
                    ),
                    writeError_1,
                  );
                  return [3 /*break*/, 16];
                case 16:
                  return [3 /*break*/, 17];
                case 17:
                  return [2 /*return*/];
              }
            });
          };
          (_i = 0), (states_2 = states);
          _a.label = 1;
        case 1:
          if (!(_i < states_2.length)) return [3 /*break*/, 4];
          state = states_2[_i];
          return [5 /*yield**/, _loop_1(state)];
        case 2:
          _a.sent();
          _a.label = 3;
        case 3:
          _i++;
          return [3 /*break*/, 1];
        case 4:
          if (!(batchCount > 0)) return [3 /*break*/, 8];
          _a.label = 5;
        case 5:
          _a.trys.push([5, 7, , 8]);
          return [4 /*yield*/, batch.commit()];
        case 6:
          _a.sent();
          batch = (0, firestore_1.writeBatch)(db);
          batchCount = 0;
          return [3 /*break*/, 8];
        case 7:
          error_2 = _a.sent();
          console.error("Error committing batch:", error_2);
          throw error_2;
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
function generateStateStats() {
  return __awaiter(this, void 0, void 0, function () {
    var statsCollection, i, stateChunk;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          statsCollection = (0, firestore_1.collection)(
            db,
            "statistics_per_state",
          );
          i = 0;
          _a.label = 1;
        case 1:
          if (!(i < states_1.US_STATES.length)) return [3 /*break*/, 4];
          stateChunk = states_1.US_STATES.slice(i, i + STATE_CHUNK_SIZE);
          return [4 /*yield*/, processStateChunk(stateChunk, statsCollection)];
        case 2:
          _a.sent();

          if (global.gc) {
            global.gc();
          }
          _a.label = 3;
        case 3:
          i += STATE_CHUNK_SIZE;
          return [3 /*break*/, 1];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}

function updateStateStatistics() {
  return __awaiter(this, void 0, void 0, function () {
    var error_4;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          return [4 /*yield*/, generateStateStats()];
        case 1:
          _a.sent();
          return [3 /*break*/, 3];
        case 2:
          error_4 = _a.sent();
          console.error("Error updating state statistics:", error_4);
          throw error_4;
        case 3:
          return [2 /*return*/];
      }
    });
  });
}

if (require.main === module) {
  updateStateStatistics()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Script failed:", error);
      process.exit(1);
    });
}
