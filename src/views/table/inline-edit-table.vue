<template>
  <div class="app-container">
    <el-button type="primary" icon="el-icon-document">
      <download-excel
        :data="products2"
        :fields="customers_fields"
        :name="'order_current_' + Date.now() + '.xls'"
      >
        Excel
      </download-excel>
    </el-button>
    <el-button type="primary" icon="el-icon-refresh" @click="syncLightspeed">
      Sync Lightspeed
    </el-button>
    <!--<el-button type="primary" icon="el-icon-time" @click="handleArchive">
      Archiver
    </el-button>
    <el-button type="primary" icon="el-icon-time" @click="handleDelete">
      Supprimer les commandes courantes
    </el-button>
    <div class="dropdown">
      <button class="dropbtn">Dropdown</button>
      <div class="dropdown-content">
        <a @click="seeVoided">Active</a>
        <a @click="seeVoided">Handle</a>
      </div>
    </div>-->
    <h3>Nombre de commande : {{ countItems }}</h3>
    <el-table :data="reverseItems" border fit highlight-current-row style="width: 100%">
      <el-table-column align="center" label="Commande" width="140">
        <template slot-scope="{row}">
          <span>{{ row['.key'] }}</span>
          <span v-if="row.inactive" style="float: left ;margin-top: -20px;margin-right:5px;">
            <br>
            <i style="color:#ff4949" class="el-icon-delete" size="medium" /> VOID
          </span>
          <span v-if="row.doublons" style="float: left ;margin-top: -20px;margin-right:5px;">
            <br>
            <i style="color:#ff4949" class="el-icon-delete" size="medium" /> DOUBLONS
          </span>
        </template>
      </el-table-column>

      <el-table-column min-width="180px" align="center" label="Nom">
        <template slot-scope="{row}">
          <div v-for="n in row.items" :key="'name-' +n.name">{{ n.name }} <br><br><br></div>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="SKU">
        <template slot-scope="{row}">
          <span v-for="n in row.items" :key="'SKU-' + n.name">{{ n.SKU }}<br><br><br></span>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="Quantité" width="110">
        <template slot-scope="{row}">
          <div v-for="n in row.items" :key="'count-' +n.name">{{ n.count }} <br><br><br></div>
        </template>
      </el-table-column>

      <el-table-column min-width="120px" label="UPC">
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <el-input v-model="row.UPC" class="edit-input" size="small" />
            <el-button
              class="cancel-btn"
              size="small"
              icon="el-icon-refresh"
              type="warning"
              @click="cancelEdit(row)"
            >
              cancel
            </el-button>
          </template>
          <span v-for="n in row.items" v-else :key="'UPC-' +n.name">{{ n.UPC }} <br><br><br></span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions" width="120">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            UPC
          </el-button>
          <el-button v-if="!row.inactive" type="primary" size="mini" style="margin:5px;" @click="handleUpdate2(row)">
            VOID
          </el-button>
          <el-button v-if="row.inactive" type="primary" size="mini" style="margin:5px;" @click="handleUpdate3(row)">
            UNVOID
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" width="800px">
      <el-form ref="dataForm" :model="temp" label-position="left" width="100%" style="width: 400px; margin-left:50px;">
        Veuillez séparer vos UPCs par un virgule.<br><br>
        <el-form-item v-for="n in temp.items" :key="'UPC-' +n.name" :label="n.name" prop="type">
          <el-input v-model="n.UPC" @keyup.enter.native="updateData(temp)" />
          <el-input-number v-model="n.count" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="updateData(temp)">
          Confirm
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible2" width="800px">
      <div slot="footer" class="dialog-footer">
        Êtes-vous sure de vouloir supprimer les commandes actives?
        <el-button @click="dialogFormVisible2 = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="clearData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible3" width="800px">
      <div slot="footer" class="dialog-footer">
        Êtes-vous sure de vouloir annuler la commande active?
        <el-button @click="dialogFormVisible3 = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="voidData(temp)">
          Confirm
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible4" width="800px">
      <div slot="footer" class="dialog-footer">
        Êtes-vous sure de vouloir synchroniser les commandes vers lightspeed? Ceci est irréversible!
        <el-button @click="dialogFormVisible4 = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="handleArchive">
          Confirm
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { rtdb } from '../../firebase'

export default {
  name: 'InlineEditTable',
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      customers_fields: {
        'SKU': 'SKU',
        'UPC4': {
          field: 'UPC',
          callback: (value) => {
            console.log(value.toString())
            return '="' + value.toString() + '"'
          }
        },
        'Quantite': 'count',
        'Nom': 'name',
        'Commande': 'order',
        'Done': ' '
      },
      products: [],
      products2: [],
      temp: {
        type: Array,
        count: Number
      },
      dialogFormVisible: false,
      dialogFormVisible2: false,
      dialogFormVisible3: false,
      dialogFormVisible4: false,
      dialogStatus: '',
      giftCards: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        type: [{ type: Array, required: true, message: 'type is required', trigger: 'change' }]
      },
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 300
      }
    }
  },
  computed: {
    reverseItems() {
      return this.products.slice().reverse()
    },
    countItems() {
      return this.products.length
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      const users = rtdb.ref('active')
      this.$rtdbBind('products', users.orderByChild('timestamp')).then(user => {
        for (const element of this.products) {
          for (const [key, value] of Object.entries(element.items)) {
            if (value.UPC) {
              console.log('yo')
            }
            console.log(`${key}: ${value}`)
            this.products2.push(value)
          }
        }
        console.log(this.products2)
        console.log(this.products)
      })
    },
    handleArchive() {
      console.log('test2')
      rtdb.ref('active').once('value', snapshot => {
        var today = new Date()
        today = today.getFullYear() + '-' + parseInt(today.getMonth() + 1) + '-' + today.getDate() + '-' + today.getHours() + '-' + today.getMinutes() + '-' + today.getSeconds()
        console.log('test2' + today)
        rtdb.ref('archive').child(today).set(snapshot.val())
        rtdb.ref('processing').update(snapshot.val())
        rtdb.ref('active').set(null)
        this.dialogFormVisible4 = false
      })
    },
    handleDelete() {
      this.dialogFormVisible2 = true
    },
    seeVoided() {
      // this.dialogFormVisible2 = true
    },
    syncLightspeed() {
      this.dialogFormVisible4 = true
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate2(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible3 = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate3(row) {
      for (const [key, value] of Object.entries(row.items)) {
        console.log(key)
        rtdb.ref('active').child(value.order).child('inactive').set(null)
      }
    },
    updateData(row) {
      /* for (const n of row.items) {
        console.log(n.name )
      } */
      for (const [key, value] of Object.entries(row.items)) {
        var upc = []
        var hasNumber = /\d/
        var ret = value.UPC.toString()
        console.log(ret)
        if (ret.includes(',')) {
          upc = ret.split(/, |,/)
        } else if (hasNumber.test(ret)) {
          upc.push(ret)
        } else {
          upc.push('0')
        }
        rtdb.ref('active').child(value.order).child('items').child(key).child('UPC').set(upc)
        rtdb.ref('active').child(value.order).child('items').child(key).child('count').set('' + value.count)
        console.log(key + upc.toString())
        this.dialogFormVisible = false
      }
      // console.log(row.items)
    },
    voidData(row) {
      for (const [key, value] of Object.entries(row.items)) {
        rtdb.ref('active').child(value.order).child('items').child(key).child('count').set('' + 0)
        rtdb.ref('active').child(value.order).child('inactive').set(true)
        this.dialogFormVisible3 = false
      }
    },
    clearData() {
      rtdb.ref('active').once('value', snapshot => {
        var today = new Date()
        today = today.getFullYear() + '-' + parseInt(today.getMonth() + 1) + '-' + today.getDate() + '-' + today.getHours() + '-' + today.getMinutes() + '-' + today.getSeconds()
        console.log('test2' + today)
        rtdb.ref('archive').child(today).set(snapshot.val()).then(user => {
          rtdb.ref('active').set(null)
        })
      })
      this.dialogFormVisible2 = false
    },
    cancelEdit(row) {
      row.title = row.originalTitle
      row.edit = false
      this.$message({
        message: 'The title has been restored to the original value',
        type: 'warning'
      })
    },
    confirmEdit(row) {
      row.edit = false
      row.originalTitle = row.title
      this.$message({
        message: 'The title has been edited',
        type: 'success'
      })
    }
  }
}
</script>

<style scoped>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
/* Dropdown Button */
.dropbtn {
  background-color: #1890ff;
  color: white;
  padding: 8px;
  margin: 5px;
  font-size: 16px;
  border: none;
}

/* The container <div> - needed to position the dropdown content */
.dropdown {
  position: relative;
  display: inline-block;
}

/* Dropdown Content (Hidden by Default) */
.dropdown-content {
  display: none;
  position: absolute;
  background-color: #f1f1f1;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}

/* Links inside the dropdown */
.dropdown-content a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

/* Change color of dropdown links on hover */
.dropdown-content a:hover {background-color: #ddd;}

/* Show the dropdown menu on hover */
.dropdown:hover .dropdown-content {display: block;}

/* Change the background color of the dropdown button when the dropdown content is shown */
.dropdown:hover .dropbtn {background-color: #1890ff;}
</style>
