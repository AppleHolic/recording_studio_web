<template>
  <div class="container">
    <!--  button part -->
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
      <!--  stop  -->
      <b-button class="record-btn"
        id="stop_record"
        @click="stopRecorder"
        v-bind:class="{'borderBlink': isRecording && !isMicStatus && isRecorderEnabled}"
        v-bind:disabled="!isRecorderEnabled"
        >
        <i class="zmdi zmdi-hc-2x zmdi-stop"></i>
      </b-button>
    </div>
    <!--  information part  -->
    <div style="height: 2vh"/>
    <h2> {{ recordedTime }} </h2>
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
    }
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
    uploadRecord (key) {
      let blob = this.recordedSound.blob
      // send twice, first. master file
      var formData = new FormData();

      formData.append('file', new File([blob], this.getRecordFileName(key), {
        type: 'audio/wav',
      }))

      this.$http.post(this.getUploadUrl(key), formData, {}, {
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
  },
  watch: {
    soundUrl (newSoundUrl) {
      this.$emit('update:soundUrl', newSoundUrl)
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
  },
  computed: {
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
  background-color: rgba(255,200,200,0.5);
  border-color: rgba(255,200,200,0.2);
  border-width: 2px;
  width: 50px;
  height: 50px;
}
</style>
