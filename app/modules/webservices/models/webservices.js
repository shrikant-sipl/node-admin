var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var moment = require('moment');

/* Code for diagnosis */
var diagnosisSchema = new Schema({
    userId :  {type :Schema.Types.ObjectId, ref:'tbl_users'},
    selfHave: { type: String },
    userRelative: { type: String },
    relativeName: { type: String },
    dateOfBirth: { type: String },
    gender: { type: String },
    otherGenderText: { type: String },
    ethnicity: { type: String },
    otherEthnicity: { type: String },
    knowDiagnosis: { type: String },
    diagnosisName: { type: String },
    eyePartName: { type: String},
    syndromeOcular: { type: String},
    dontKnowExactPartOfEye: { type: String },
    bloodRelatedPersonInFamily: { type: String},
    nameOfPersonsInFamily: { type: Array },
    //Inheritance
    typeOfInheritance: { type: String },
    typeOfInheritanceOtherText: { type: String },
    typeOfInheritanceImage: { type: String },
    //VisualAcuity
    leftEyeMeasureVisualAcuity: { type: String },
    rightEyeMeasureVisualAcuity: { type: String },
    leftEyeMeasureVisualSee: { type: String },
    leftEyeMeasureVisualNotSee: { type: String },
    rightEyeMeasureVisualSee: { type: String },
    rightEyeMeasureVisualNotSee: { type: String },
    //Refraction
    leftEyeRefractionMeasurement: { type: String },
    rightEyeRefractionMeasurement: { type: String },
    refractionMeasurementDontHave: { type: String },
    imagesTestRefractionMeasurement: { type: Array },
    //Intraocular
    leftEyeIntraocularPressureIOP: { type: String },
    leftEyeIntraocularPressureMethod: { type: String },
    leftEyeIntraocularPressureOthr: { type: String },
    rightEyeIntraocularPressureIOP: { type: String },
    rightEyeIntraocularPressureMethod: { type: String },
    rightEyeIntraocularPressureOthr: { type: String },
    //Perimetry measure
    leftEyeMeasuredOptions: { type: Array },
    leftEyeMeasuredNoImage: { type: String },
    leftEyeMeasuredOther: { type: String },
    leftEyeMeasuredPerimetry: { type: Array },
    leftEyeMeasuredPerimetryImages: { type: Array },
    rightEyeMeasuredOptions: { type: Array },
    rightEyeMeasuredNoImage: { type: String },
    rightEyeMeasuredOther: { type: String },
    rightEyeMeasuredPerimetry: { type: Array },
    rightEyeMeasuredPerimetryImages: { type: Array },
    //Progression
    progressionVisionStablePart1: { type: String },
    progressionVisionStablePart2: { type: String },
    progressionVisionDeteriorates: { type: Array },
    progressionVisionOther: { type: String },
    progressionVisionRates: { type: String },
    //Fundus
    leftEyeFundusExam: { type: String },
    rightEyeFundusExam: { type: String },
    leftEyeFundusExamImages: { type: Array },
    rightEyeFundusExamImages: { type: Array },
    fundusExamDontHaveImages: { type: String },
    //OCT
    leftEyeCoherenceOctOptions: { type: Array },
    coherenceOctDontHave: { type: String },
    leftEyeCoherenceOctIhave: { type: String },
    leftEyeCoherenceOctOther: { type: String },
    rightEyeCoherenceOctOptions: { type: Array },
    rightEyeCoherenceOctIhave: { type: String },
    rightEyeCoherenceOctOther: { type: String },
    leftEyeCohrncOctMeasurement: { type: Array },
    rightEyeCohrncOctMeasurement: { type: Array },
    leftEyeCoherenceOctImages: { type: Array },
    rightEyeCoherenceOctImages: { type: Array },
    //ERG
    leftEyeErgRecordingStimulus: { type: Array },
    rightEyeErgRecordingStimulus: { type: Array },
    leftEyeErgRecordingOther: { type: String },
    rightEyeErgRecordingOther: { type: String },
    leftEyeErgRecordingImages: { type: Array },
    rightEyeErgRecordingImages: { type: Array },
    recordingErgDontHaveImages: { type: String },
    //MRI
    leftEyeMRIDescription: { type: String },
    rightEyeMRIDescription: { type: String },
    mriImages: { type: Array },
    //Genetic
    geneticallyConfirm: { type: String },
    geneticallyConfirmImages: { type: Array },
    
    createdDate: { type: Date, default: Date.now },
    updatedDate: { type: Date },
    screensArray: { type: Array },
    diagnosisStatus: { type: String, default: 'incompleted' },
    screenCode: { type: String }
})
var diagnosis =  mongoose.model('tbl_diagnosis_records', diagnosisSchema);

/**  * Pre-save hook  */ 
diagnosisSchema.pre('save', function(next) {
  this.updatedDate = Date.now();
  
  next();
});
diagnosisSchema.post('init', function(doc) {
    this.formatedDate =  moment(this.createdDate).format('DD.MM.YYYY');
});

/* Code for users */
var UserSchema = new Schema({
    firstName: { type: String, trim: true, require: true },
    lastName: { type: String, trim: true, require: true },
    email: { type: String, trim: true, index: true, unique: true, require: true },
    password: { type: String, require: true },
    role: { type: String },
    gender: { type: String},
    phone: { type: String },
    ethnicity: { type: String },
    status: { type: Number, default: 1 },
    deviceToken: { type: Array},
    deviceType: { type: String },
    notification: { type: String, default: '1'},
    reminder: { type: String, default: '1' },
    createdDate: { type: Date, default: Date.now },
    updatedDate: { type: Date }
})
var user =  mongoose.model('tbl_users', UserSchema);

/* Code for contact */
var ContactSchema = new Schema({
    requestType: { type: String },
    userId: { type: String },
    message: { type: String },
    createdDate: { type: Date, default: Date.now }
})
var contact =  mongoose.model('tbl_contacts', ContactSchema);
/* Code for Screens */
var ScreenSchema = new Schema({
    screenCode: { type: String },
    squence: { type: Number }
})
var screens =  mongoose.model('tbl_screens', ScreenSchema);
/* Get relatives data */
var RelativeSchema = new Schema({
    name: { type: String }
})
var relative  = mongoose.model('tbl_relations', RelativeSchema);

/* Get Visual data */
var visualSchema = new Schema({
    visualAcuity: { type: String }
})
var visual  = mongoose.model('tbl_visual_acuities', visualSchema);

/* Get Optic Nerve Disk data */
var OpticSchema = new Schema({
    name: { type: String }
})
var Optic  = mongoose.model('tbl_optic_nerve_disks', OpticSchema);

/* Get macula data */
var maculaSchema = new Schema({
    name: { type: String }
})
var macula  = mongoose.model('tbl_maculas', maculaSchema);

/* Get vessels data */
var vesselsSchema = new Schema({
    name: { type: String }
})
var vessel  = mongoose.model('tbl_blood_vessels', vesselsSchema);

/* Get peripheral data */
var peripheralSchema = new Schema({
    name: { type: String }
})
var peripheral  = mongoose.model('tbl_peripheral_retinas', peripheralSchema);

/* Get diseases data */
var diseasesSchema = new Schema({
    name: { type: String }
})
var diseases  = mongoose.model('tbl_diseases', diseasesSchema);
/* All schemas */
module.exports = { user: user, relative: relative, visual: visual, Optic: Optic, macula: macula, vessel: vessel, peripheral: peripheral, diagnosis: diagnosis, screens: screens, contact: contact, diseases: diseases};
