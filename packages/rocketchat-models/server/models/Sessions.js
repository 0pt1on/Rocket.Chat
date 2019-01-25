import { Base } from './_Base';

export class Sessions extends Base {
	constructor(...args) {
		super(...args);

		this.tryEnsureIndex({ instanceId: 1, sessionId: 1, year: 1, month: 1, day: 1 }, { unique: 1 });
		this.tryEnsureIndex({ instanceId: 1, sessionId: 1, userId: 1 });
		this.tryEnsureIndex({ instanceId: 1, sessionId: 1 });
		this.tryEnsureIndex({ year: 1, month: 1, day: 1 });
	}

	createOrUpdate(data = {}) {
		const { year, month, day, sessionId, instanceId } = data;

		if (!year || !month || !day || !sessionId || !instanceId) {
			return;
		}

		const now = new Date;

		return this.upsert({ instanceId, sessionId, year, month, day }, {
			$set: data,
			$setOnInsert: {
				createdAt: now,
			},
		});
	}

	closeByInstanceIdAndSessionId(instanceId, sessionId) {
		const query = {
			instanceId,
			sessionId,
			closedAt: { $exists: 0 },
		};

		const closeTime = new Date();
		const update = {
			$set: {
				closedAt: closeTime,
				lastActivityAt: closeTime,
			},
		};

		return this.update(query, update);
	}

	updateActiveSessionsByDateAndInstanceIdAndIds({ year, month, day } = {}, instanceId, sessions, data = {}) {
		const query = {
			instanceId,
			year,
			month,
			day,
			sessionId: { $in: sessions },
			closedAt: { $exists: 0 },
		};

		const update = {
			$set: data,
		};

		return this.update(query, update, { multi: true });
	}

	logoutByInstanceIdAndSessionIdAndUserId(instanceId, sessionId, userId) {
		const query = {
			instanceId,
			sessionId,
			userId,
			logoutAt: { $exists: 0 },
		};

		const logoutAt = new Date();
		const update = {
			$set: {
				logoutAt,
			},
		};

		return this.update(query, update, { multi: true });
	}

	createBatch(sessions) {
		if (!sessions || sessions.length === 0) {
			return;
		}

		const ops = [];
		sessions.forEach((doc) => {
			const { year, month, day, sessionId, instanceId } = doc;
			delete doc._id;

			ops.push({
				updateOne: {
					filter: { year, month, day, sessionId, instanceId },
					update: {
						$set: doc,
					},
					upsert: true,
				},
			});
		});

		return this.model.rawCollection().bulkWrite(ops, { ordered: false });
	}
}

export default new Sessions('sessions');
