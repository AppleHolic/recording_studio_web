<template>
  <!--  record  -->
  <div class="container h-100 " id="vconvert">
    <div class="row h-100">
      <div class="col-lg-6 my-auto record_outer">
        <!-- Sound Recorder -->
        <sound-recorder id="recorder"
          :soundUrl.sync="soundUrl"
          :soundBlob.sync="soundBlob"
          :isRecorderEnabled="isRecorderEnabled"
          ref="soundRef"/>

        <!-- recorded sounds -->
        <div id="record_player">
          <audio controls="" name="media" ref="player">
            <source v-bind:src="soundUrl" type="audio/wav" v-if="soundUrl !== ''">
          </audio>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import SoundRecorder from '@/components/SoundRecorder'
export default {
  name: 'Home',
  data () {
    return {
      soundUrl: '',
      soundBlob: '',
      convBlob: '',
      isRecorderEnabled: true,
    };
  },
  mounted: function () {
    this.$watch('soundUrl', function() {
        this.$refs.player.load()
    });
  },
  methods: {
    voice2Voice () {
      let formData = new FormData();
      formData.append('wav', this.soundBlob)
      this.$http.post('convert', formData, {responseType: 'arraybuffer'}, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(res => {
        var blob = new Blob([res.data], {type: 'audio/wav'});
        this.convBlob = blob
        this.soundUrl = URL.createObjectURL(this.convBlob)
      })
    }
  },
  computed: {
    isRecorded () {
      return this.soundUrl !== ''
    }
  },
  components: {
    'sound-recorder' : SoundRecorder
  }
}
</script>
<style scoped>
#main-image {
  margin-bottom: 5vh;
  height: 60vh;
}
#recorder {
  margin-top: 5vh;
}
#record_player {
  margin-top: 5vh;
}
.record_outer {
  padding-bottom: 10vh;
  align-content: center;
}
@media only screen and (max-height: 768px) {
  .record_outer {
    padding-bottom: 0;
    padding-top: 5vh;
  }
}
.speech-bubble {
	position: relative;
  min-height: 10vh;
  font-size: 2em;
  background-color: rgba(255,200,200,0.5);
  border-color: rgba(255,200,200,0.2);
  transition: none;
  padding: 1em;
}
.btn {
  border-radius: 1rem;
}
.btn-secondary:active {
  border: none;
}
.btn-secondary:hover {
  color: rgba(255,255,255,0.8);
}
.speech-bubble:after {
	content: '';
	position: absolute;
	left: 0;
	top: 50%;
	width: 0;
	height: 0;
	border: 20px solid transparent;
	border-right-color: rgba(255,200,200,0.5);
	border-left: 0;
	border-bottom: 0;
	margin-top: -10px;
	margin-left: -20px;
}
video {
    object-fit: contain;
}
</style>
