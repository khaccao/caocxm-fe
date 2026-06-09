import { createSlice } from "@reduxjs/toolkit";

import { GroupDTO } from "@/services/GroupService";
interface GroupState {
    group: GroupDTO[];
    createGroupData?: GroupDTO;
    searchStr: string;
}
const initialState: GroupState = {
    createGroupData: undefined,  
    group: [],
    searchStr: '',
};
const groupSlice = createSlice({
    name: 'group',
    initialState,
    reducers: {
        setGroups: (state, action) => {
            state.group = action.payload;
        },
        getGroupsRequest: (state, action) => {},
        createGroupRequest: (state, action) => {},
        setCreateGroups: (state, action) => {state.createGroupData = action.payload
        }, 

        updateGroupRequest: (state, action) => {},

        removeGroupsRequest: (state, action) => {},
        deleteEmployeeGroupRequest: (state, action) => {},

        editGroupRequest: (state, action) => {},
        deleteAttachmentLinks: (state, action) => {},
        uploadAttachmentLinks: (state, action) => {},
        getImageUrlAttachmentLinks: (state, action) => {},
        updateAttachementImageUrl: (state, action) => {},
        addMemberToGroupRequest: (state, action) => {},
        moveEmployeeRequest: (state, action) => {},
        setSearchStr: (state, action) => {state.searchStr = action.payload}, 
    }
});
export const groupActions = groupSlice.actions;
export const GroupReducer = groupSlice.reducer;
