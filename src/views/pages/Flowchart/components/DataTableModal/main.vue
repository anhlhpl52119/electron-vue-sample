<template>
  <div class="wrapper">
    <div class="space-align-block">
      <a-space align="end">
        <a-button
          type="primary"
          @click="handleImportButtonClicked"
        >
          Import Data Table
        </a-button>

        <a-button
          type="primary"
          @click="handleImportMultipleButtonClicked"
        >
          Import Multiple Table Data
        </a-button>
      </a-space>
    </div>
  </div>

  <a-table
    :columns="columns"
    :data-source="rows"
    size="small"
    bordered
    row-key="id"
    :show-header="true"
    :pagination="{
      position: 'top'
    }"
  >
    <template #actions="{ record }">
      <span>
        <a-button @click="handleRowInfoButtonClicked(record)">
          <template #icon>
            <InfoCircleOutlined />
            
          </template>
        </a-button>

        <a-divider type="vertical" />
        <a-button @click="handleRowEditButtonClicked(record)">
          <template #icon><EditOutlined /></template>
        </a-button>

        <a-divider type="vertical" />
        <a-popconfirm
          title="Sure to delete?"
          @confirm="handleRowDeleteButtonClicked(record)"
        >
          <a-button>
            <template #icon><DeleteOutlined /></template>
          </a-button>
        </a-popconfirm>
        <a-divider type="vertical" />
      </span>
    </template>
    <template
      #filterDropdown="{
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
        column,
      }"
    >
      <div style="padding: 8px">
        <a-input
          ref="searchInput"
          :placeholder="`Search ${column.dataIndex}`"
          :value="selectedKeys[0]"
          style="width: 188px; margin-bottom: 8px; display: block"
          @change="
            (e) => setSelectedKeys(e.target.value ? [e.target.value] : [])
          "
          @pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)"
        />
        <a-button
          type="primary"
          size="small"
          style="width: 90px; margin-right: 8px"
          @click="handleSearch(selectedKeys, confirm, column.dataIndex)"
        >
          <template #icon>
            <SearchOutlined />
          </template>
          Search
        </a-button>
        <a-button
          size="small"
          style="width: 90px"
          @click="handleReset(clearFilters)"
        >
          Reset
        </a-button>
      </div>
    </template>
    <template #filterIcon="filtered">
      <search-outlined :style="{ color: filtered ? '#108ee9' : undefined }" />
    </template>
    <template #customRender="{ text, column }">
      <span v-if="searchText && searchedColumn === column.dataIndex">
        <template
          v-for="(fragment, i) in text
            .toString()
            .split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i'))"
        >
          <mark
            v-if="fragment.toLowerCase() === searchText.toLowerCase()"
            :key="i"
            class="highlight"
          >
            {{ fragment }}
          </mark>
          <template v-else>{{ fragment }}</template>
        </template>
      </span>
      <template v-else>
        {{ text }}
      </template>
    </template>
  </a-table>

  <ImportedTableDialog
    :is-open="importedTableDialog.isOpen"
    :record="importedTableDialog.record"
    @close="handleImportedTableDialogClose"
    @success="handleImportTableDialogSubmitSuccess"
  />

  <ImportedTableDataDialog 
    :record="importedTableDataDialog?.record"
    :is-open="importedTableDataDialog?.isOpen"
    @close="handleImportedTableDataDialogClose"
  />

  <ImportedMultipleTableDataDialog
    :record="importedMultipleTableDataDialog?.record"
    :is-open="importedMultipleTableDataDialog?.isOpen"
    @close="handleimportedMultipleTableDataDialogClose"
    @success="handleImportMultipleTableDialogSubmitSuccess"
  />
</template>

<script>
import { deleteUploadedFilePath } from "@/utils/upload";
import ImportedTableDataDialog from "./modal/ImportedTableDataDialog"
import ImportedTableDialog from "./modal/ImportedTableDialog"
import ImportedMultipleTableDataDialog from "./modal/ImportedMultiTableDialog";

import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  InfoCircleOutlined
} from "@ant-design/icons-vue";

import {
  fetchImportedTable,
  removeImportedTableRecord,
  showTempTableRecord,
  DynamicColumn,
} from "@/services/datatable";

const COLUMN_SLOT = {
  filterDropdown: "filterDropdown",
  filterIcon: "filterIcon",
  customRender: "customRender",
};
const TABLE_COLUMNS = [
  {
    title: "Database Name",
    dataIndex: "logicalTableName",
    key: "logicalTableName",
    width: "30%",
    sorter: (record, record2) => record.logicalTableName > record2.logicalTableName ? 1 : -1,
    slots: COLUMN_SLOT,
    onFilter: (value, record) => record['logicalTableName']?.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
    // sorter: (record, record2) => record.description > record2.description ? 1 : -1,
    width: "35%",
  },
  {
    title: "Actions",
    dataIndex: "actions",
    key: "actions",
    slots: {
      customRender: "actions",
    },
  },
]

export default {
  components: {
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    InfoCircleOutlined,
    ImportedTableDialog,
    ImportedTableDataDialog,
    ImportedMultipleTableDataDialog
    
  },
emits: ['change'],
  data() {
    return {
      searchText: "",
      searchedColumn: "",
      rows: [],
      valueColumnsModal: [],
      valuedataSource: [],
      importedTableDialog: {
        isOpen: false,
        record: null
      },
      importedTableDataDialog: {
        isOpen: false,
        record: null
      },
      importedMultipleTableDataDialog: {
        isOpen: false,
        record: null,
      },
    };
  },
  computed: {
    columns: () => TABLE_COLUMNS
  },
  mounted() {
    this.loadImportedTable();
  },
  methods: {
    handleRowInfoButtonClicked: function(record) {
      this.importedTableDataDialog.isOpen = true
      this.importedTableDataDialog.record = record
    },
    handleRowEditButtonClicked: function(record) {
      this.importedTableDialog = {
        ...this.importedTableDialog,
        isOpen: true,
        record: JSON.parse(JSON.stringify(record))
      }
    },
    handleRowDeleteButtonClicked: async function(record) {
      await removeImportedTableRecord(record)
      this.rows = this.rows.filter(
        (task) => record.id !== task.id
      );
      this.$emit("change")
      // deleteUploadedFilePath(record.importedFilePath);
    },

    handleImportedTableDialogClose() {
      this.importedTableDialog.isOpen = false;
    },

    // newwwwww
    loadImportedTable: function() {
      fetchImportedTable().then((rows) => {
        this.rows = rows
      });
    },

    loadTempTable: async function(record) {
      const data = await showTempTableRecord(record['physicalDbName'])
      this.valuedataSource = data
      this.valueColumnsModal = DynamicColumn(data);
    },

    handleImportButtonClicked: function() {
      this.toggleImportedTableDialog(true)
      this.importedTableDialog.record = null
    },

    handleImportMultipleButtonClicked: function () {
      this.importedMultipleTableDataDialog.isOpen = true;
      this.importedMultipleTableDataDialog.record = null;
    },

    handleImportTableDialogSubmitSuccess: function() {
      this.loadImportedTable()
      this.importedTableDialog.isOpen = false
      this.$emit("change")
    },

    handleImportMultipleTableDialogSubmitSuccess: function () {
      this.loadImportedTable();
      this.importedMultipleTableDataDialog.isOpen = false;
      this.$emit("change")

    },

    toggleImportedTableDialog: function(isOpen) {
      this.importedTableDialog.isOpen = isOpen
    },

    handleImportedTableDataDialogClose: function() {
      this.importedTableDataDialog.isOpen = false
    },

    handleimportedMultipleTableDataDialogClose: function(){
      this.loadImportedTable();
      this.importedMultipleTableDataDialog.isOpen = false;
    },
    
    handleSearch: function(selectedKeys, confirm, dataIndex) {
      confirm();
      this.searchText = selectedKeys[0];
      this.searchedColumn = dataIndex;
    },

    handleReset: function(clearFilters) {
      clearFilters();
      this.searchText = "";
    }
  },
};
</script>
<style scoped>
.wrapper {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
}
.space-align-block {
  margin: 8px 4px;
  padding: 4px;
  flex: none;
}
</style>
