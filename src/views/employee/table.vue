<template>
  <div class="app-container">
    <el-button type="primary" icon="el-icon-refresh" @click="addGiftCard">
      Ajoutez un employée
    </el-button>
    <el-table :data="reverseItems" border fit highlight-current-row style="width: 100%">
      <el-table-column align="center" label="Nom Complet" width="160">
        <template slot-scope="{row}">
          <span>{{ row.fName + ' ' + row.lName }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Email">
        <template slot-scope="{row}">
          <span>{{ row.email }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Phone">
        <template slot-scope="{row}">
          <span>{{ row.phone }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actif">
        <template slot-scope="{row}">
          <span v-if="row.active"><i style="color:green" class="el-icon-check" size="medium" /></span>
          <span v-else><i style="color:#ff4949" class="el-icon-error" size="medium" /></span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Actions" width="120">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row,row['.key'])">
            Modifiez
          </el-button>
          <el-button type="primary" size="mini" style="margin:5px;" @click="handleUpdate2(row,row['.key'])">
            Actif
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="800px">
      <el-form ref="dataForm" :model="temp" label-position="left" width="100%" style="width: 400px; margin-left:50px;">
        Éditez l'employée? <br><br>
        <el-form-item :key="'UPC-'" :label="''" prop="type">
          Prénom
          <el-input v-model="temp.fName" :label="'Prénom'" />
          Nom
          <el-input v-model="temp.lName" :label="'Nom'" />
          Email
          <el-input v-model="temp.email" :label="'Email'" />
          Password temporaire
          <el-input v-model="temp.password" :label="'Password'" />
          Téléphone
          <el-input v-model="temp.phone" :label="'Téléphone'" />
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
      <el-form ref="dataForm" :model="temp" label-position="left" width="100%" style="width: 400px; margin-left:50px;">
        Veuillez remplir les champs pour ajouter un nouvel employée!<br>
        <el-form-item :key="'UPC-'" prop="type">
          Prénom
          <el-input v-model="temp.fName" :label="'Prénom'" />
          Nom
          <el-input v-model="temp.lName" :label="'Nom'" />
          Email
          <el-input v-model="temp.email" :label="'Email'" />
          Password temporaire
          <el-input v-model="temp.password" :label="'Password'" />
          Téléphone
          <el-input v-model="temp.phone" :label="'Téléphone'" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible2 = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="updateData2(temp)">
          Confirm
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible3" width="800px">
      <el-form ref="dataForm" :model="temp2" label-position="left" width="100%" style="width: 400px; margin-left:50px;">
        Faire un paiement!<br>
        <el-form-item :key="'UPC-'" prop="type">
          Numéro de confirmation
          <el-input v-model="temp2.confirmNumber" :label="'Numéro de confirmation'" />
          Montant
          <el-input v-model="temp2.amount" type="number" :label="'montant'" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible3 = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="updateData3(temp2)">
          Confirm
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { rtdb, auth2 } from '../../firebase'

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
      totalBalance: 0,
      temp: {
      },
      temp2: {
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
      return this.products.slice()
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      const users = rtdb.ref('employee')
      this.$rtdbBind('products', users).then(user => {
        // console.log(this.products)
      })
    },
    handleUpdate(row, key) {
      console.log(key)
      this.temp = Object.assign({}, row) // copy obj
      this.temp.key = key
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate3(row, key) {
      console.log(key)
      this.temp2 = Object.assign({}, row) // copy obj
      this.temp2.key = key
      this.dialogStatus = 'update'
      this.dialogFormVisible3 = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    addGiftCard() {
      this.dialogFormVisible2 = true
    },
    handleUpdate2(row, key) {
      rtdb.ref('employee').child(key).child('active').set(!row.active)
    },
    updateData(row) {
      console.log(row)
      if (row.taxNumber !== '') {
        row.taxable = true
      } else {
        row.taxable = false
      }
      rtdb.ref('employee').child(row.key).set(row)
      this.dialogFormVisible = false
    },
    updateData2(row) {
      auth2.createUserWithEmailAndPassword(row.email, row.password)
        .then((userCredential) => {
          row.active = true
          if (row.taxNumber) {
            row.taxable = true
          } else {
            row.taxNumber = ''
          }
          rtdb.ref('employee').child(userCredential.user.uid).set(row)
        })
        .catch((error) => {
          console.log(error)
        })
      this.dialogFormVisible2 = false
    },
    updateData3(row) {
      console.log(row)
      var today = new Date()
      today = today.getDate() + '-' + parseInt(today.getMonth() + 1) + '-' + today.getFullYear() + ' à ' + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds()
      row.date = today
      rtdb.ref('paiements').push().set(row)
      this.dialogFormVisible3 = false
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
