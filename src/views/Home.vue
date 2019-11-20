<template>
  <!--  record  -->
  <div class="container h-100 ">
    <div class="row h-100">
      <div class="col-lg-12 my-auto record_outer">
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
</style>
