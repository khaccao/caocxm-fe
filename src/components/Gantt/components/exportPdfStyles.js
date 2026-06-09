export const stylesEpxort = `
.no-progress {
  display: none !important;
}

.progress_input_container {
  max-width: 60px;
}

.isCategory .gantt_tree_content {
  font-weight: bold;
}

.isCategory .dateText,
.isCategory .durationText,
.isCategory .progressText {
  display: none !important;
}

.weekend {
  background: #F2F4F7;
}

.gantt_task_row.gantt_selected .weekend {
  background-color: #fff3a1;
}

.gantt_task_row.gantt_selected {
  background-color: #fff3a1;
}

.toDay {
  border-left: 2px solid #0050B3 !important;
}

.gantt_task .gantt_task_scale .gantt_scale_cell {
  font-size: 14px !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji' !important;
  list-style: none !important;
  color: rgba(0, 0, 0, 0.88) !important;
  font-weight: 600 !important;
  border-width: 1px;
  border-style: solid;
  border-color: #E9EBF0;
}

.full-progress .gantt_task_progress {
  background: #14aeea;
}
.gantt_task_progress_wrapper {
  min-width: 5px !important;
}

.gantt_task_progress {
  min-width: 5px !important;
  background: #fed33b;
}

.gantt_tree_content {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  font-size: 14px;
  box-sizing: border-box;
  color: rgba(0, 0, 0, 0.88);
  word-break: break-word;
}

.timeline_cell .gantt_task_row:not(:last-child) {
  border: 0px;
}

.gantt_grid_scale .gantt_grid_head_cell {
  border-top: none !important;
  border-right: 1px solid #E9EBF0 !important;
}

.gantt_grid_data .gantt_cell {
  border-right: 1px solid #E9EBF0;
  color: #454545;
}

.gantt_row_task {
  border-bottom: 0px;
}


.gantt_row_task .gantt_cell {
  line-height: 35px !important;
  border-bottom: 1px solid #ebebeb;
}

.gantt_row_task .gantt_cell:not(:first-child) {
  display: flex;
  align-items: center;
}
  .gantt_tree_content {
   white-space: normal;
  }

.gantt_task_line {
  background: #BAE7FF;
  border-radius: 20px;
  border: none;
  box-shadow: none;
}

.gantt_line_wrapper div {
  background-color: #B9BEC7 !important;
}

.gantt_task_link div.gantt_link_arrow {
  display: none;
}

.gantt_task_row.gantt_selected .gantt_task_cell {
  border-right-color: #E9EBF0;
}
.progress-gantt {
    margin: 7px 0;
    max-height: 15px;
  }
.gantt_task_content {
    display: none;
  }
.gantt-custom-right-text, .gantt-custom-left-text {
  font-weight: 600;
  font-size: 14px;
  margin-top: -7px;
}
.gantt_link_arrow_right {
  border-left-color: #B9BEC7 !important;
}
.gantt_link_arrow_left {
  border-right-color: #B9BEC7 !important;
}

.gantt_row .gantt_cell:last-child, .gantt_grid_scale .gantt_grid_head_cell:last-child {
  width: 60px !important;
}
.gantt_row .gantt_cell, .gantt_grid_scale .gantt_grid_head_cell {
  min-width: 100px !important;
}
.gantt_container {
  padding: 20px !important
}
`