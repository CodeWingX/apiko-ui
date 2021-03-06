<template>
  <div>

    <form @submit.prevent="updateCollectionProperty">
      <div class="control is-grouped">
        <p class="control is-expanded">
          <input v-model="propertyName" class="input" type="text" placeholder="Lowercase name, e.g.: 'author'">
        </p>
        <p class="control has-addons">
          <span class="select">
            <select v-model="type">
              <option v-for="(lengths, type) in availableTypes">{{ type }}</option>
            </select>
          </span>
          <input v-model="length" class="input" type="text" :placeholder="lengthPlaceholder" :disabled="propertyType.length === false" :class="{'is-danger': !lengthIsValid}">
        </p>
        <p class="control">
          <button v-if="name === ''" type="submit" class="button is-primary"><span class="icon"><i class="fa fa-plus-circle"></i></span><span>ADD</span></button>
          <button v-else type="submit" class="button is-primary"><span class="icon"><i class="fa fa-floppy-o"></i></span><span>SAVE</span></button>
        </p>
      </div>
      <p>&nbsp;<small v-if="propertyType.description">{{ propertyType.description }}</small></p>
      <p class="control is-expanded">
        <input v-model="comment" class="input" type="text" placeholder="Optional comment">
      </p>
    </form>

    <doc name="collection-property"></doc>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: ['collection', 'name'],
  computed: {
    ...mapGetters(['property']),
    // build the final object that will be saved
    propertySetup () {
      let payload = {
        collection: this.collection,
        originalName: this.name,
        name: this.propertyName,
        prop: {
          type: this.type
        }
      }
      if (this.length) {
        payload.prop.type += ' ' + this.length
      }
      if (this.comment) {
        payload.prop.comment = this.comment
      }
      return payload
    },
    propertyType () {
      return this.availableTypes[this.type] || null
    },
    // "length" field placeholder text
    lengthPlaceholder () {
      if (this.propertyType.length && typeof this.propertyType.length === 'string') {
        return this.propertyType.length
      }
      return ''
    },
    // check that the value of the "length" field is valid
    lengthIsValid () {
      if (!this.propertyName) {
        return true
      }
      if (this.length && this.length.length === 0) {
        return true
      }
      if (!this.propertyType.lengthValidation) {
        return true
      }
      return this.propertyType.lengthValidation(this.length)
    }
  },
  created () {
    this.getPropertyData()
  },
  watch: {
    collection () {
      this.getPropertyData()
    },
    name () {
      this.propertyName = this.name
      this.getPropertyData()
    }
  },
  data () {
    return {
      // property definition
      propertyName: this.name,
      type: null,
      length: null,
      comment: null,
      // types configuration
      availableTypes: {
        'INTEGER': {
          description: 'Integer number',
          length: '1-2147483647',
          lengthValidation: (value) => parseInt(value) <= 2147483647 && parseInt(value) >= 1
        },
        'CHAR': {
          description: 'A fixed length string',
          length: '1-255, defaults to 255',
          lengthValidation: (value) => parseInt(value) <= 255 && parseInt(value) >= 1
        },
        'STRING': {
          description: 'A variable length string (VARCHAR)',
          length: '1-255, defaults to 255',
          lengthValidation: (value) => parseInt(value) <= 255 && parseInt(value) >= 1
        },
        'TEXT': {
          description: 'Longer string (e.g. for articles)',
          length: 'tiny,medium,long',
          lengthValidation: (value) => ['tiny', 'medium', 'long'].indexOf(value) !== -1
        },
        'BIGINT': {
          description: 'An attribute defined as BIGINT will be treated like a string in order to prevent precision loss',
          length: false
        },
        'FLOAT': {
          description: 'Floating point number (4-byte precision), comma-separated lengths',
          length: 'e.g.: 5,2'
        },
        'DOUBLE': {
          description: 'Floating point number (8-byte precision), comma-separated lengths',
          length: 'e.g.: 5,2'
        },
        'DECIMAL': {
          description: 'Decimal number, comma-separated lengths',
          length: 'e.g.: 5,2'
        },
        'BOOLEAN': {
          description: 'A Boolean or TINYINT, depending on database',
          length: false
        },
        'TIME': {
          description: 'A TIME column',
          length: false
        },
        'DATE': {
          description: 'A DATETIME column',
          length: false
        },
        'DATEONLY': {
          description: 'A date only column',
          length: false
        },
        'BLOB': {
          description: 'Binary storage (e.g. for files)',
          length: 'tiny,medium,long',
          lengthValidation: (value) => ['tiny', 'medium', 'long'].indexOf(value) !== -1
        },
        'ENUM': {
          description: 'Enumeration, comma-separated allowed values',
          length: 'e.g.: Tokyo,Bogota,Prague'
        }
      }
    }
  },
  methods: {
    resetPropertyData () {
      // defaults
      this.type = 'INTEGER'
      this.length = ''
      this.comment = ''
    },
    getPropertyData () {
      this.resetPropertyData()
      // check in store if property is available
      const property = this.property(this.collection, this.propertyName)
      if (!property) {
        return
      }
      // assign the property values to the component
      if (property.type) {
        [this.type, this.length] = property.type.split(' ')
      }
      if (property.length) {
        this.length = property.length
      }
      if (property.comment) {
        this.comment = property.comment
      }
    },
    updateCollectionProperty () {
      this.$store.commit('UPDATE_COLLECTION_PROPERTY', this.propertySetup)
      this.$parent.$forceUpdate()
      this.$emit('save')

      // reset data to defaults
      this.propertyName = ''
      this.resetPropertyData()
    }
  }
}
</script>

<style scoped>
</style>
