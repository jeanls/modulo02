import BeeQueue from 'bee-queue';
import CancellationMail from '../jobs/CancellationMail';
import redisConfig from '../config/redis';

const jobs = [CancellationMail];

class Queue {
  constructor() {
    this.queues = {};
    this.init();
  }

  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        beeQueue: new BeeQueue(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  add(queue, job) {
    return this.queues[queue].beeQueue.createJob(job).save();
  }

  process() {
    jobs.forEach((job) => {
      const { beeQueue, handle } = this.queues[job.key];
      beeQueue.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, error) {
    // eslint-disable-next-line no-console
    console.log(`Queue ${job.queue.name}: Failed`, error);
  }
}

export default new Queue();
