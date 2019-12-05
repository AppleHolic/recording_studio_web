<template>
  <div class="container">
    <b-row>
      <b-col sm="2">
        <label for="pageField">Jump to : </label>
      </b-col>
      <b-col sm="2">
        <b-form-input id="pageField" type="number" v-model="jumpIndex"></b-form-input>
      </b-col>
      <b-col sm="1">
        <b-button variant="outline-primary" @click="jumpToItem()">Go</b-button>
      </b-col>
      <b-col sm="3">
        <b-form-group>
          <b-form-radio v-model="pageSelected" name="all" value="all">All</b-form-radio>
          <b-form-radio v-model="pageSelected" name="un-recorded" value="unrec">Un-Recorded</b-form-radio>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col id="script_panel" sm="8">
        <div id="script_list">
          <div class="col" id="script-table" ref="script-table">
            <b-row>

            </b-row>
            <div style="height: 2vh"/>

            <b-table
                show-empty
                  stacked="md"
                  :items="recordData"
                  :fields="recordFields"
             >
               <template v-slot:cell(key)="data">
                 <b-button variant="outline-primary"
                   :id="'record_'+data.value"
                   :ref="'record_'+data.value"
                   @click="setSelectedKey(data.value)">
                   {{ data.value }}
                 </b-button>
               </template>
               <template v-slot:cell(text)="data">
                 <p> {{ data.value }} </p>
               </template>
               <template v-slot:cell(recorded)="data">
                 <p v-if="data.value !== ''"> Recorded </p>
                 <p v-else> Not Recorded </p>
               </template>
            </b-table>
          </div>
        </div>
      </b-col>
      <b-col id="record_panel" sm="4" style="padding-top: 5vh">
        <div>
          <!--  start, pause, restart-->
          <b-button class="record-btn"
            id="record_btn"
            @click="toggleRecorder"
            v-bind:class="{'borderBlink': isMicStatus && soundUrl === '' && isRecorderEnabled}"
            v-bind:disabled="!isRecorderEnabled"
            >
            <i class="zmdi zmdi-hc-2x" v-bind:class="{ 'zmdi-pause': isRecording && !isMicStatus, 'zmdi-mic': isMicStatus}"></i>
          </b-button>
          <b-tooltip target="record_btn" triggers="hover">
            Start record
          </b-tooltip>
          <!--  stop  -->
          <b-button class="record-btn"
            id="stop_record"
            @click="stopRecorder"
            v-bind:class="{'borderBlink': isRecording && !isMicStatus && isRecorderEnabled}"
            v-bind:disabled="!isRecorderEnabled"
            >
            <i class="zmdi zmdi-hc-2x zmdi-stop"></i>
          </b-button>
          <b-tooltip target="stop_record" triggers="hover">
            Stop record
          </b-tooltip>
          <b-button class="record-btn" id="delete_rec">
            <i class="zmdi zmdi-hc-2x zmdi-delete"></i>
          </b-button>
          <b-tooltip target="delete_rec" triggers="hover">
            Delete current recorded audio
          </b-tooltip>
          <b-button class="record-btn" id="upload_rec" @click="uploadRecord()">
            <i class="zmdi zmdi-hc-2x zmdi-upload"></i>
          </b-button>
          <b-tooltip target="upload_rec" triggers="hover">
            Upload/Update current recorded audio
          </b-tooltip>
        </div>
        <!--  information part  -->
        <div style="height: 2vh"/>
        <h2> {{ recordedTime }} </h2>

        <div style="height: 4vh"/>
        <h4> Recorded Sound </h4>

        <!-- recorded sounds -->
        <audio controls="" name="media" ref="player">
          <source v-bind:src="soundUrl" type="audio/wav" v-if="soundUrl !== ''">
        </audio>

        <div style="height: 4vh"/>
        <h4> Selected Sample : {{ selectedKey }} </h4>

        <audio controls="" name="media" ref="sample_player">
          <source v-bind:src="sampleSoundUrl" type="audio/wav" v-if="sampleSoundUrl !== ''">
        </audio>

      </b-col>
    </b-row>
  </div>
</template>
<script>
import Recorder             from '../soundjs/recorder.js'
import { convertTimeMMSS }  from '../soundjs/utils.js'
export default {
  name: 'SoundRecorder',
  props: {
    isRecorderEnabled : { type: Boolean, default: true},
    attempts  : { type: Number                  },
    compact   : { type: Boolean, default: false },
    time      : { type: Number                  },
    uploadUrl : { type: String                  },
    submitBtnStr : { type: String, default: 'Submit' },
    successfulUploadMsg : { type: String, default: 'Upload successful' },
    failedUploadMsg     : { type: String, default: 'Upload fail'       }
  },
  data () {
    return {
      isUploading: false,
      recorder: new Recorder({
        afterStop: () => {
          var ls = this.recorder.recordList()
          var record = ls[ls.length-1]
          this.recordedSound = { idx: 0, url: record.url, blob: record.blob }
        },
        attempts: this.attempts,
        time: this.time,
      }),
      recordedSound: { idx: 0, url: '', blob: ''},
      uploadStatus: null,
      // page information
      nb_pages: 0,
      recordData : [
        {'key': '', 'text': '', 'recorded': '', 'wave': ''},
      ],
      recordActiveData : {
        'key': '', 'text': ''
      },
      recordFields: ['key', 'text', 'recorded'],
      sampleBlob: '',
      jumpIndex: 0,
      selectedKey: '',
      pageSelected: 'all',
      sampleSoundUrl: '',
    }
  },
  mounted: function () {
    this.$watch('soundUrl', function() {
        this.$refs.player.load()
    });
    this.$watch('sampleSoundUrl', function() {
        this.$refs.sample_player.load()
    });
  },
  methods: {
    toggleRecorder () {
      if (this.attempts && this.recorder.records.length >= this.attempts) {
        return
      }
      if (!this.isRecording || (this.isRecording && this.isPause)) {
        this.recorder.start()
        if (this.startRecord) {
          this.startRecord('start record')
        }
      } else {
        this.recorder.pause()
        if (this.startRecord) {
          this.startRecord('pause record')
        }
      }
    },
    stopRecorder () {
      if (!this.isRecording) {
        return
      }
      this.recorder.stop()
    },
    selectRecord (idx, record) {
      this.selectedRecord = { idx: idx, url: record.url, blob: record.blob }
    },
    onStartUpload () {
      this.isUploading = true
    },
    onEndUpload (status) {
      this.isUploading = false
      this.uploadStatus = status
      setTimeout(() => {this.uploadStatus = null}, 1500)
    },
    uploadRecord () {
      let blob = this.recordedSound.blob
      // send twice, first. master file
      var formData = new FormData();

      formData.append('file', new File([blob], 'file', {
        type: 'audio/wav',
      }))

      this.$http.post('item/' + this.selectedKey, formData, {}, {
        headers: {
          'Content-Type': 'audio/wav',
        }
      }).then(res => {
        console.log('Complete', res)
      }, res => {
        console.log('Uploading has been failed', res)
      })
    },
    // url methods
    setNumberPages () {
      let _this = this
      _this.$http.get('page-numbers/all').then(res => {
        _this.nb_pages = res['body']['nb_pages']
      }, res => {
        console.log('falied to load page numbers', res)
      })
    },
    convertData(raw) {
      var rawLength = raw.length;
      var array = new Uint8Array(new ArrayBuffer(rawLength));
      for(var i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
      }
      return array;
    },
    getBlobUrl (raw_str) {
      let binary = this.convertData(raw_str);
      let blob = new Blob([binary], {type: 'audio/wav'});
      return URL.createObjectURL(blob)
    },
    loadPageWaves () {
      for (var idx = 0; idx < this.recordData.length ; idx ++){
        let record = this.recordData[idx]
        let sample = record['wave']
        let recorded = record['recorded']
        if (sample !== '') {
          this.recordData[idx]['wave'] = this.getBlobUrl(sample)
        }
        if (recorded !== '') {
          this.recordData[idx]['recorded'] = this.getBlobUrl(recorded)
        }
      }
    },
    setSelectedSampleBlob ( key ) {
      let _this = this
      _this.$http.get('audio/wave/' + key, {responseType: 'arraybuffer'}).then(res => {
        var blob = new Blob([res.data], {type: 'audio/wav'});
        _this.sampleBlob = blob
        _this.sampleSoundUrl = URL.createObjectURL(_this.sampleBlob)
      }, res => {
        console.log('falied to load sample', res)
      })
      _this.$http.get('audio/recorded/' + key, {responseType: 'arraybuffer'}).then(res => {
        var blob = new Blob([res.data], {type: 'audio/wav'});
        _this.recordedSound['blob'] = blob
        _this.recordedSound['url'] = URL.createObjectURL(_this.recordedSound['blob'])
      }, res => {
        console.log('falied to load sample', res)
      })
    },
    setSelectedKey ( key ) {
      this.setSelectedSampleBlob(key)
      this.selectedKey = key
      this.recordedSound = { idx: 0, url: '', blob: ''}
    },
    getRecordDataPage ( pageIdx ) {
      let _this = this
      _this.$http.get('page/all/' + pageIdx).then(res => {
        _this.recordData = res['body']['info']
        console.log(_this.recordData)
      }, res => {
        console.log('falied to load page numbers', res)
      })
    },
    jumpToItem () {
      this.getRecordDataPage(this.jumpIndex)
      setTimeout(() => {
        this.setSelectedKey(this.recordData[0]['key'])
      }, 1000)
    },
    getRecordItem ( key ) {
      let _this = this
      _this.$http.get('item/' + key).then(res => {
        _this.recordActiveData = res['body']
      }, res => {
        console.log('falied to load page numbers', res)
      })
    }
  },
  watch: {
    soundUrl (newSoundUrl) {
      this.$emit('update:soundUrl', newSoundUrl)
    },
    sampleSoundUrl (newSampleUrl) {
      this.$emit('update:sampleSoundUrl', newSampleUrl)
    },
    soundBlob (newSoundBlob) {
      this.$emit('update:soundBlob', newSoundBlob)
    },
    isRecorderEnabled (newIsRecorderEnabled) {
      if ( !newIsRecorderEnabled ) {
        // TODO: replace this part when vc is added
        this.recordedSound.url = ''
        this.recordedSound.blob = ''
        this.$emit('update:soundUrl', this.soundUrl)
      }
    },
  },
  created: function () {
    this.setNumberPages()
    this.getRecordDataPage (0)
    setTimeout(() => {
      this.setSelectedKey(this.recordData[0]['key'])
    }, 1000)
  },
  computed: {
    isRecorded () {
      return this.soundUrl !== ''
    },
    attemptsLeft () {
      return this.attempts - this.recorder.records.length
    },
    isMicStatus () {
      return !this.isRecording || (this.isRecording && this.isPause)
    },
    iconButtonType () {
      return this.isRecording && this.isPause ? 'mic' : this.isRecording ? 'pause' : 'mic'
    },
    isPause () {
      return this.recorder.isPause
    },
    isRecording () {
      return this.recorder.isRecording
    },
    message () {
      return this.uploadStatus === 'success' ? this.successfulUploadMsg : this.failedUploadMsg
    },
    recordedTime () {
      if (this.time && this.recorder.duration >= this.time * 60) {
        this.stopRecorder()
      }
      return convertTimeMMSS(this.recorder.duration)
    },
    uploadStatusClasses () {
      let classes = ['ar__upload-status']
      classes.push(this.uploadStatus === 'success' ? 'ar__upload-status--success' : 'ar__upload-status--fail')
      return classes.join(' ')
    },
    volume () {
      return parseFloat(this.recorder.volume)
    },
    soundUrl () {
      return this.recordedSound.url
    },
    soundBlob () {
      return this.recordedSound.blob
    }
  }
}
</script>
<style scoped>
.record-btn {
  background-color: rgba(0,0,0,0.5);
  border-color: rgba(0,0,0,0.2);
  border-width: 2px;
  width: 50px;
  height: 50px;
}
</style>
