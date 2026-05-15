import dotenv from dotenv;
import mongoose from mongoose;
import Topic from ..srcmodelsTopic;
import BoardQuestion from ..srcmodelsBoardQuestion;
import Case from ..srcmodelsCase;
import Video from ..srcmodelsVideo;
import Note from ..srcmodelsNote;
import UserStat from ..srcmodelsUserStat;

dotenv.config();
const MONGO_URI = process.env.MONGO_URI  mongodb127.0.0.127017medknowledge;

(async()={
  await mongoose.connect(MONGO_URI);
  const sections = [Nephrology,Endocrinology,Hematology,Oncology]; 
  for(const s of sections){
    await Topic.create([{ title `${s} Topic A`, section s }, { title `${s} Topic B`, section s }]);
    await BoardQuestion.create([{ section s, difficulty hard }, { section s, difficulty medium }]);
    await Case.create([{ section s }, { section s }]);
    await Video.create([{ section s, durationSec 600 }]);
    await Note.create([{ section s }]);
  }
  await UserStat.findOneAndUpdate({ userId guest }, { $set { plan free, solved 42, accuracy 78, streakDays 3, todaySolved 5 } }, { upsert true });
  console.log(Seed done);
  process.exit(0);
})();
