"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const routing_controllers_1 = require("routing-controllers");
const entity_1 = require("../users/entity");
const entities_1 = require("./entities");
const index_1 = require("../index");
let GameController = class GameController {
    async createGame(user) {
        const entity = await entities_1.Game.create().save();
        await entities_1.Player.create({
            game: entity,
            user,
            symbol: 'x'
        }).save();
        const game = await entities_1.Game.findOneById(entity.id);
        index_1.io.emit('action', {
            type: 'ADD_GAME',
            payload: game
        });
        return game;
    }
    async joinGame(user, gameId) {
        const game = await entities_1.Game.findOneById(gameId);
        if (!game)
            throw new routing_controllers_1.BadRequestError(`Game does not exist`);
        if (game.status !== 'pending')
            throw new routing_controllers_1.BadRequestError(`Game is already started`);
        game.status = 'started';
        await game.save();
        const player = await entities_1.Player.create({
            game,
            user,
            symbol: 'o'
        }).save();
        index_1.io.emit('action', {
            type: 'UPDATE_GAME',
            payload: await entities_1.Game.findOneById(game.id)
        });
        return player;
    }
    async updateGame(user, gameId, update) {
        const game = await entities_1.Game.findOneById(gameId);
        if (!game)
            throw new routing_controllers_1.NotFoundError(`Game does not exist`);
        const updateBoard = update.game;
        const { clickedCell } = updateBoard;
        if (user.id === 1) {
            game.clickedCell1 = clickedCell;
            game.played1 = 1;
        }
        else if (user.id === 2) {
            game.clickedCell2 = clickedCell;
            game.played2 = 1;
        }
        await game.save();
        const countSymbol = (board, symbol) => {
            const arrX = [];
            for (let row = 0; row < board.length; row++) {
                for (let cell = 0; cell < board[row].length; cell++) {
                    if (board[row][cell] === symbol) {
                        arrX.push([row, cell]);
                    }
                }
            }
            return arrX.length;
        };
        const nX = countSymbol(game.board, 'x');
        const nO = countSymbol(game.board, 'o');
        console.log('\n\nnumber of X:\n\n', nX);
        console.log('\n\nnumber of Y:\n\n', nO);
        const b1 = game.clickedCell1;
        const b2 = game.clickedCell2;
        const b1b2Same = b1 === b2;
        const allPlayed = game.played1 && game.played2;
        function markCell(clickedCell, symbol) {
            const [rowIndex, columnIndex] = clickedCell.split('-');
            if (game)
                game.board[rowIndex][columnIndex] = symbol;
        }
        if (!b1b2Same && allPlayed) {
            markCell(game.clickedCell1, 'x');
            game.clickedCell1 = '---';
            game.clickedCell2 = '---';
            game.played1 = 0;
            game.played2 = 0;
            game.points1 += 100;
        }
        else if (b1b2Same && allPlayed) {
            markCell(game.clickedCell2, 'o');
            game.clickedCell1 = '---';
            game.clickedCell2 = '---';
            game.played1 = 0;
            game.played2 = 0;
            game.points2 += 300;
        }
        await game.save();
        index_1.io.emit('action', {
            type: 'UPDATE_GAME',
            payload: game
        });
        return game;
    }
    getGame(id) {
        return entities_1.Game.findOneById(id);
    }
    getGames() {
        return entities_1.Game.find();
    }
};
__decorate([
    routing_controllers_1.Authorized(),
    routing_controllers_1.Post('/games'),
    routing_controllers_1.HttpCode(201),
    __param(0, routing_controllers_1.CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entity_1.default]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "createGame", null);
__decorate([
    routing_controllers_1.Authorized(),
    routing_controllers_1.Post('/games/:id([0-9]+)/players'),
    routing_controllers_1.HttpCode(201),
    __param(0, routing_controllers_1.CurrentUser()),
    __param(1, routing_controllers_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entity_1.default, Number]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "joinGame", null);
__decorate([
    routing_controllers_1.Authorized(),
    routing_controllers_1.Patch('/games/:id([0-9]+)'),
    __param(0, routing_controllers_1.CurrentUser()),
    __param(1, routing_controllers_1.Param('id')),
    __param(2, routing_controllers_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entity_1.default, Number, Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "updateGame", null);
__decorate([
    routing_controllers_1.Authorized(),
    routing_controllers_1.Get('/games/:id([0-9]+)'),
    __param(0, routing_controllers_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "getGame", null);
__decorate([
    routing_controllers_1.Authorized(),
    routing_controllers_1.Get('/games'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GameController.prototype, "getGames", null);
GameController = __decorate([
    routing_controllers_1.JsonController()
], GameController);
exports.default = GameController;
//# sourceMappingURL=controller.js.map