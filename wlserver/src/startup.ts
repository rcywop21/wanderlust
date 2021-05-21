import { PlayerState, questIds, TeamId } from "wlcommon";
import { makeIssueQuestTransform } from "./actions";
import { applyTransform, gameState } from "./stateMgr";

const makeStartingPlayerState = (): PlayerState => ({
    locationId: 'Shores',
    oxygenUntil: null,
    quests: {},
    inventory: {},
    streamCooldownExpiry: {},
    storedOxygen: null,
    stagedAction: null,
    knowsCrimson: false,
    knowsLanguage: false,
    foundEngraving: false,
    hasMap: false,
    unlockedAlcove: false,
    unlockedShrine: false,
    unlockedWoods: false,
});

const setupGameState = (): void => {
    for (let i = 0; i < 10; ++i) {
        gameState.players.push(makeStartingPlayerState());
        applyTransform(makeIssueQuestTransform(questIds.CHAPTER_1), i as TeamId);
    }
}

export default setupGameState;